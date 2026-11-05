import { serverEnv } from "@/lib/env";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  token?: string;
  expiresAt?: string;
}

export const SESSION_COOKIE_NAME = "tw_session";

function getSessionPassword(): string {
  return serverEnv.auth.sessionSecret;
}

function computeCookieMaxAge(expiresAt: string): number {
  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) {
    return 0;
  }

  return Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
}

let cachedSessionOptions: SessionOptions | null = null;

export function getSessionOptions(): SessionOptions {
  if (!cachedSessionOptions) {
    cachedSessionOptions = {
      password: getSessionPassword(),
      cookieName: SESSION_COOKIE_NAME,
      cookieOptions: {
        httpOnly: true,
        secure: serverEnv.runtime.isProduction,
        sameSite: "lax",
        path: "/",
      },
    };
  }
  return cachedSessionOptions;
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

export function hasUsableSession(session: SessionData): boolean {
  return Boolean(session.token) && !isSessionExpired(session.expiresAt);
}

export async function setSessionToken(token: string, expiresAt: string) {
  const maxAge = computeCookieMaxAge(expiresAt);
  const session = await getIronSession<SessionData>(await cookies(), {
    ...getSessionOptions(),
    cookieOptions: {
      ...getSessionOptions().cookieOptions,
      maxAge: maxAge > 0 ? maxAge : undefined,
    },
  });
  session.token = token;
  session.expiresAt = expiresAt;
  await session.save();
}

export async function clearSession() {
  const session = await getSession();
  session.destroy();
}

export async function getSessionToken(): Promise<string | undefined> {
  const session = await getSession();
  return session.token;
}

export function isSessionExpired(expiresAt: string | undefined): boolean {
  if (!expiresAt) {
    return false;
  }

  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) {
    return false;
  }

  return expiresMs <= Date.now();
}

export function getSessionPasswordForEdge(): string {
  return getSessionPassword();
}

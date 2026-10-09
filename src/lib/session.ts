import { serverEnv } from "@/lib/env";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { NetworkType } from "@/types/network.entity";

export interface StoredNetworkSession {
  token: string;
  expiresAt: string;
}

export interface SessionData {
  token?: string;
  expiresAt?: string;
  byNetwork?: Partial<Record<NetworkType, StoredNetworkSession>>;
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

export function readNetworkSession(
  session: SessionData,
  network: NetworkType,
): StoredNetworkSession | undefined {
  if (session.byNetwork) {
    return session.byNetwork[network];
  }

  if (network === "testnet" && session.token) {
    return {
      token: session.token,
      expiresAt: session.expiresAt ?? "",
    };
  }

  return undefined;
}

export function assignNetworkSession(
  session: SessionData,
  network: NetworkType,
  token: string,
  expiresAt: string,
): void {
  const byNetwork: Partial<Record<NetworkType, StoredNetworkSession>> = {
    ...session.byNetwork,
  };

  if (!byNetwork.testnet && session.token && network !== "testnet") {
    byNetwork.testnet = {
      token: session.token,
      expiresAt: session.expiresAt ?? "",
    };
  }

  byNetwork[network] = { token, expiresAt };
  session.byNetwork = byNetwork;
  session.token = token;
  session.expiresAt = expiresAt;
}

export function clearNetworkSession(
  session: SessionData,
  network: NetworkType,
): void {
  const byNetwork: Partial<Record<NetworkType, StoredNetworkSession>> = {
    ...session.byNetwork,
  };

  if (!session.byNetwork && session.token && network !== "testnet") {
    byNetwork.testnet = {
      token: session.token,
      expiresAt: session.expiresAt ?? "",
    };
  }

  delete byNetwork[network];
  session.byNetwork = byNetwork;

  const remaining = byNetwork.mainnet ?? byNetwork.testnet;
  session.token = remaining?.token;
  session.expiresAt = remaining?.expiresAt;
}

export function hasUsableSession(session: SessionData): boolean {
  if (session.byNetwork) {
    return Object.values(session.byNetwork).some(
      (entry) => Boolean(entry?.token) && !isSessionExpired(entry?.expiresAt),
    );
  }

  return Boolean(session.token) && !isSessionExpired(session.expiresAt);
}

export async function setSessionToken(
  token: string,
  expiresAt: string,
  network: NetworkType = "testnet",
) {
  const maxAge = computeCookieMaxAge(expiresAt);
  const session = await getIronSession<SessionData>(await cookies(), {
    ...getSessionOptions(),
    cookieOptions: {
      ...getSessionOptions().cookieOptions,
      maxAge: maxAge > 0 ? maxAge : undefined,
    },
  });
  assignNetworkSession(session, network, token, expiresAt);
  await session.save();
}

export async function clearSessionForNetwork(
  network: NetworkType,
): Promise<void> {
  const session = await getSession();
  clearNetworkSession(session, network);
  if (!hasUsableSession(session)) {
    session.destroy();
    return;
  }
  await session.save();
}

export async function clearSession() {
  const session = await getSession();
  session.destroy();
}

export async function getSessionToken(
  network: NetworkType = "testnet",
): Promise<string | undefined> {
  const session = await getSession();
  return readNetworkSession(session, network)?.token;
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

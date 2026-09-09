import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";
import {
  getSessionPasswordForEdge,
  isSessionExpired,
  SESSION_COOKIE_NAME,
  type SessionData,
} from "@/lib/session";
import { serverEnv } from "@/lib/env";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware-client";
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
} from "@/features/admin-auth/constants/admin-auth.constants";
import { matchesAllowedEmailDomain } from "@/features/admin-auth/utils/email-domain";

/**
 * The app runs two independent auth systems:
 *
 * - `/dashboard` — Stellar wallet SEP-10 with an iron-session cookie (`tw_session`)
 * - `/admin`     — Supabase email + password + TOTP (`sb-*` cookies)
 *
 * They never share cookies, state or sign-out paths.
 */

// ── /dashboard — wallet + iron-session ──────────────────────────────────────

async function handleDashboardRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const session = await unsealData<SessionData>(sessionCookie.value, {
      password: getSessionPasswordForEdge(),
    });

    if (!session.token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isSessionExpired(session.expiresAt)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("reason", "session_expired");
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

// ── /admin — Supabase ───────────────────────────────────────────────────────

function readClaim(
  claims: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = claims?.[key];
  return typeof value === "string" ? value : null;
}

async function handleAdminRequest(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === ADMIN_LOGIN_PATH;

  const { supabase, getResponse, applyAuthCookies } =
    createSupabaseMiddlewareClient(request);

  // Must run before any response is built: @supabase/ssr server clients are
  // lazily initialized, and a refresh triggered later cannot be written back.
  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : (data?.claims ?? null);

  const aal = readClaim(claims, "aal");
  const email = readClaim(claims, "email");
  const isFullyAuthenticated =
    claims !== null &&
    aal === "aal2" &&
    matchesAllowedEmailDomain(email, serverEnv.adminAuth.allowedEmailDomain);

  if (isLoginRoute) {
    // Public, and matched on purpose: middleware is the only layer that can
    // refresh tokens. Only bounce a *fully* authenticated admin away — bouncing
    // a partial (aal1) session would ping-pong with the login flow.
    if (isFullyAuthenticated) {
      return applyAuthCookies(
        NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url)),
      );
    }

    return getResponse();
  }

  if (isFullyAuthenticated) {
    return getResponse();
  }

  const reason =
    claims === null
      ? "unauthenticated"
      : aal !== "aal2"
        ? "mfa_required"
        : "forbidden_domain";

  // Middleware can write cookies, so terminate the rejected session here.
  // `signOut` clears every chunk of the auth cookie; deleting by name cannot,
  // because the chunk count is unknown.
  if (claims !== null) {
    await supabase.auth.signOut({ scope: "global" }).catch(() => undefined);
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set("redirect", pathname);
  loginUrl.searchParams.set("reason", reason);

  return applyAuthCookies(NextResponse.redirect(loginUrl));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === ADMIN_HOME_PATH || pathname.startsWith(`${ADMIN_HOME_PATH}/`)) {
    return handleAdminRequest(request);
  }

  return handleDashboardRequest(request);
}

export const config = {
  // `/api/admin/**` is deliberately NOT matched: `/admin/:path*` is anchored at
  // the root, so the existing operator proxy keeps its iron-session guard.
  matcher: ["/dashboard/:path*", "/admin", "/admin/:path*"],
};

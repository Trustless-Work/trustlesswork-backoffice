"use client";

import {
  disconnectWalletKitSafe,
  resetWalletKitLoader,
} from "@/components/tw-blocks/wallet-kit/wallet-kit";
import { getRegisteredQueryClient } from "@/lib/query-client-holder";

export const AUTH_EXPIRED_EVENT = "tw:auth-expired";

export type AuthExpiredReason = "session_expired" | "unauthorized" | "logout";

type ClearClientAuthStateOptions = {
  reason?: AuthExpiredReason;
  redirect?: boolean;
  redirectTo?: string;
};

let intentionalLogout = false;

export function beginIntentionalLogout(): void {
  intentionalLogout = true;
}

export function endIntentionalLogout(): void {
  intentionalLogout = false;
}

export function isIntentionalLogout(): boolean {
  return intentionalLogout;
}

function buildLoginRedirect(reason: AuthExpiredReason): string {
  const params = new URLSearchParams();
  if (reason === "session_expired") {
    params.set("reason", "session_expired");
  }
  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}

function clearWalletStorage(): void {
  localStorage.removeItem("walletAddress");
  localStorage.removeItem("walletName");
}

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * True when the operator is in the Supabase MFA backoffice.
 * Wallet connect there is for payroll signing and is independent of SEP-10.
 */
export function isAdminAuthArea(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return isAdminPath(window.location.pathname);
}

export async function clearClientAuthState(
  options: ClearClientAuthStateOptions = {},
): Promise<void> {
  const {
    reason = "unauthorized",
    redirect = true,
    redirectTo = buildLoginRedirect(reason),
  } = options;

  if (reason === "logout") {
    beginIntentionalLogout();
  }

  if (reason === "session_expired" && intentionalLogout) {
    return;
  }

  const queryClient = getRegisteredQueryClient();
  queryClient?.setQueryData(["session", "me"], null);
  queryClient?.removeQueries({ queryKey: ["session"] });

  // `/admin` uses Supabase MFA, not the wallet iron-session. Operators often
  // keep a wallet connected for payroll without a dashboard SEP-10 session —
  // wiping the kit / localStorage on every refresh would disconnect them.
  // Still clear the cached SEP-10 user above; skip wallet teardown + redirect.
  if (isAdminAuthArea()) {
    return;
  }

  clearWalletStorage();
  resetWalletKitLoader();
  await disconnectWalletKitSafe();

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { reason } }),
    );
  }

  if (redirect && typeof window !== "undefined") {
    const currentPath = window.location.pathname;

    if (!currentPath.startsWith("/login")) {
      window.location.assign(redirectTo);
    }
  }
}

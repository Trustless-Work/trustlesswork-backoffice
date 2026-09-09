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

    // `/admin` is a separate auth system (Supabase, `sb-*` cookies). Losing the
    // wallet iron-session there is expected and must not bounce the operator to
    // the wallet login page. The cleanup above still runs; only the redirect is
    // suppressed.
    const isWalletAuthArea =
      !currentPath.startsWith("/login") && !currentPath.startsWith("/admin");

    if (isWalletAuthArea) {
      window.location.assign(redirectTo);
    }
  }
}

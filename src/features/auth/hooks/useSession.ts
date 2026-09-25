"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import type { UserResponse } from "@/types";
import {
  clearClientAuthState,
  endIntentionalLogout,
  isAdminAuthArea,
  isIntentionalLogout,
} from "@/features/auth/lib/logout-client";

function hasStoredWalletAddress(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(localStorage.getItem("walletAddress"));
}

export function useSession() {
  const query = useQuery<UserResponse | null>({
    queryKey: ["session", "me"],
    queryFn: () => authService.getSessionUser(),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      endIntentionalLogout();
      return;
    }

    // Admin has no SEP-10 session by design; a stored wallet is for payroll
    // signing and must not be treated as an expired dashboard login.
    if (isAdminAuthArea()) {
      return;
    }

    if (
      query.isSuccess &&
      query.data === null &&
      hasStoredWalletAddress() &&
      !isIntentionalLogout()
    ) {
      void clearClientAuthState({ reason: "session_expired" });
    }
  }, [query.data, query.isSuccess]);

  return query;
}

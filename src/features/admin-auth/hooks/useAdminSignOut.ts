"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { adminAuthService } from "@/features/admin-auth/services/admin-auth.service";
import {
  ADMIN_LOGIN_PATH,
  ADMIN_SIGN_OUT_PATH,
} from "@/features/admin-auth/constants/admin-auth.constants";

/**
 * Signs the operator out of the /admin area only.
 *
 * Deliberately does NOT touch the wallet flow: no `clearClientAuthState` (it
 * disconnects the wallet kit, wipes localStorage and can redirect to `/login`),
 * no `authService.logout()` (that destroys the iron-session) and no
 * `beginIntentionalLogout()` (that flag only exists to suppress the wallet
 * flow's session-expired UX).
 *
 * No toast and no `?reason=` on the redirect — per AUTH_SESSION_UX, only a real
 * expiry or a guard rejection carries a reason.
 */
export function useAdminSignOut() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);

    try {
      // Browser client clears the sb-* cookies it owns via document.cookie...
      await adminAuthService.signOutQuietly("global");

      // ...and the route handler clears anything middleware wrote server-side.
      await fetch(ADMIN_SIGN_OUT_PATH, {
        method: "POST",
        credentials: "same-origin",
      }).catch(() => undefined);
    } finally {
      router.replace(ADMIN_LOGIN_PATH);
      router.refresh();
      setIsSigningOut(false);
    }
  }, [router]);

  return { signOut, isSigningOut };
}

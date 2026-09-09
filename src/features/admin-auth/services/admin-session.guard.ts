import { cache } from "react";
import { redirect } from "next/navigation";
import { serverEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  ADMIN_SIGN_OUT_PATH,
  ADMIN_LOGIN_PATH,
} from "@/features/admin-auth/constants/admin-auth.constants";
import {
  adminUsersService,
  createAdminUserRowFetcher,
} from "@/features/admin-auth/services/admin-users.service";
import { evaluateAdminClaims } from "@/features/admin-auth/utils/admin-session";
import type {
  AdminSession,
  AdminSessionResult,
} from "@/features/admin-auth/types/admin-auth.types";

/**
 * Server-side authorization for the /admin area.
 *
 * Wrapped in React `cache()` so calling it from a layout and from every nested
 * page within the same render costs one round-trip, not several.
 *
 * Middleware is not enough on its own: it is a routing check, its matcher is a
 * static list that misses route handlers and Server Actions, and it deliberately
 * skips the database lookup. Layouts are not enough either: they do not re-run
 * on every nested client navigation. So this runs in the layout AND in every
 * protected page and handler.
 *
 * This is the ONLY layer that checks the `ADMIN` role, so it is the authoritative
 * one. `public.users` has RLS disabled, which means the role check is what
 * authorizes — and it is safe here precisely because the email it matches on
 * comes from `getUser()`, a network-verified session, never from the request.
 */
export const getAdminSession = cache(async (): Promise<AdminSessionResult> => {
  const supabase = await createSupabaseServerClient();

  // Network-verified identity. Never trust the user object from getSession().
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { status: "unauthenticated" };
  }

  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  const verdict = evaluateAdminClaims(
    {
      userId: userData.user.id,
      email: userData.user.email ?? null,
      aal: aalData?.currentLevel ?? null,
    },
    serverEnv.adminAuth.allowedEmailDomain,
  );

  if (verdict.status !== "ok") {
    return verdict;
  }

  // Only now pay for the database round-trip: a row in `public.users` carrying
  // the ADMIN role. A missing row and a row without the role are the same
  // rejection on purpose, so the response cannot be used to enumerate accounts.
  const user = await adminUsersService.findAdminByEmail(
    createAdminUserRowFetcher(supabase),
    verdict.email,
  );
  if (!user) {
    return { status: "not_an_admin", userId: verdict.userId };
  }

  return {
    status: "ok",
    userId: verdict.userId,
    email: verdict.email,
    user,
  };
});

/**
 * Returns the admin session or redirects away. Call this from every protected
 * layout, page, route handler and Server Action.
 *
 * Rejections route through the sign-out handler rather than straight to the
 * login page: `forbidden_domain` and `not_an_admin` must terminate the session,
 * and a Server Component cannot write cookies.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const result = await getAdminSession();

  if (result.status === "ok") {
    return result;
  }

  if (result.status === "unauthenticated") {
    // Nothing to clear; skip the extra hop.
    redirect(`${ADMIN_LOGIN_PATH}?reason=unauthenticated`);
  }

  redirect(`${ADMIN_SIGN_OUT_PATH}?reason=${result.status}`);
}

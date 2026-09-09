import { matchesAllowedEmailDomain } from "@/features/admin-auth/utils/email-domain";
import type {
  AdminClaimsInput,
  AdminClaimsVerdict,
} from "@/features/admin-auth/types/admin-auth.types";

/**
 * Pure authorization verdict for a Supabase session claiming /admin access.
 *
 * Kept free of any Supabase client so the branchy security logic is testable
 * with zero mocks. Callers do the I/O and hand the extracted values in.
 *
 * Order matters: identity, then second factor, then the domain allowlist.
 * The `public.users` lookup is deliberately NOT here — it is a database
 * round-trip the middleware must not pay on every navigation.
 */
export function evaluateAdminClaims(
  input: AdminClaimsInput,
  allowedDomain: string | null | undefined,
): AdminClaimsVerdict {
  const userId = input.userId?.trim();
  if (!userId) {
    return { status: "unauthenticated" };
  }

  // Anything other than aal2 (including null and a future "aal3") means the
  // second factor has not been verified for this session.
  if (input.aal !== "aal2") {
    return { status: "mfa_required", userId };
  }

  if (!matchesAllowedEmailDomain(input.email, allowedDomain)) {
    return { status: "forbidden_domain", userId, email: input.email ?? "" };
  }

  return { status: "ok", userId, email: (input.email ?? "").trim().toLowerCase() };
}

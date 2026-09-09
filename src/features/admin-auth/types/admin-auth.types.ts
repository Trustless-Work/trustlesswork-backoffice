import type { EntityId, IsoDateTimeString } from "@/types";

/**
 * Row of `public.users` matched to the signed-in Supabase identity.
 *
 * Deliberately NOT unified with the core-API `UserResponse` in `@/types`:
 * that one describes a Trustless Work platform user reached over the BFF,
 * this one is the Postgres row that authorizes a backoffice operator.
 *
 * `id` is a bigint in Postgres and arrives as a JSON number; it is normalized to
 * `EntityId` (a string) so nothing downstream depends on numeric precision.
 */
export type AdminUserRow = {
  readonly id: EntityId;
  readonly email: string;
  readonly roles: readonly string[];
  readonly createdAt: IsoDateTimeString | null;
};

// ── Server-side session evaluation ──────────────────────────────────────────

export type AdminClaimsInput = {
  readonly userId: string | null;
  readonly email: string | null;
  readonly aal: string | null;
};

export type AdminClaimsVerdict =
  | { readonly status: "ok"; readonly userId: string; readonly email: string }
  | { readonly status: "unauthenticated" }
  | { readonly status: "mfa_required"; readonly userId: string }
  | {
      readonly status: "forbidden_domain";
      readonly userId: string;
      readonly email: string;
    };

export type AdminSession = {
  readonly status: "ok";
  readonly userId: string;
  readonly email: string;
  readonly user: AdminUserRow;
};

export type AdminSessionResult =
  | AdminSession
  | Exclude<AdminClaimsVerdict, { status: "ok" }>
  | { readonly status: "not_an_admin"; readonly userId: string };

export type AdminSessionRejectionReason = Exclude<
  AdminSessionResult["status"],
  "ok"
>;

export function isAdminSession(
  result: AdminSessionResult,
): result is AdminSession {
  return result.status === "ok";
}

const ADMIN_SESSION_REJECTION_REASONS = [
  "unauthenticated",
  "mfa_required",
  "forbidden_domain",
  "not_an_admin",
] as const satisfies readonly AdminSessionRejectionReason[];

export function isAdminSessionRejectionReason(
  value: string | null | undefined,
): value is AdminSessionRejectionReason {
  return (
    typeof value === "string" &&
    ADMIN_SESSION_REJECTION_REASONS.some((reason) => reason === value)
  );
}

// ── Client-side login state machine ─────────────────────────────────────────

export type AdminMfaChallenge = {
  readonly factorId: string;
  readonly challengeId: string;
  /** UNIX seconds after which the challenge is no longer usable. */
  readonly expiresAt: number;
};

export type AdminTotpEnrollment = {
  /** `otpauth://` URI from `mfa.enroll`. Never log this. */
  readonly uri: string;
  /** TOTP secret for manual entry. Never log this. */
  readonly secret: string;
};

export type AdminLoginStep =
  | { readonly kind: "credentials" }
  | ({ readonly kind: "mfa_challenge" } & AdminMfaChallenge)
  | ({ readonly kind: "mfa_enroll" } & AdminMfaChallenge & AdminTotpEnrollment);

export type AdminMfaStep = Extract<
  AdminLoginStep,
  { kind: "mfa_challenge" | "mfa_enroll" }
>;

export function isAdminMfaStep(step: AdminLoginStep): step is AdminMfaStep {
  return step.kind === "mfa_challenge" || step.kind === "mfa_enroll";
}

export type AdminTotpFactors = {
  readonly verified: readonly { readonly id: string }[];
  readonly unverified: readonly { readonly id: string }[];
};

import { isAuthError, isAuthRetryableFetchError } from "@supabase/supabase-js";

/**
 * Product-level classification of a Supabase auth failure.
 *
 * Plays the role `parseApiError` plays for axios responses. Supabase errors are
 * deliberately NOT routed through that helper — it expects an axios shape.
 */
export type AdminAuthErrorKind =
  | "invalid_credentials"
  | "invalid_totp_code"
  | "challenge_expired"
  | "factor_conflict"
  | "mfa_not_enabled"
  | "too_many_factors"
  | "rate_limited"
  | "network"
  | "unknown";

export type AdminAuthError = {
  readonly kind: AdminAuthErrorKind;
  readonly message: string;
};

const MESSAGES: Record<AdminAuthErrorKind, string> = {
  invalid_credentials: "Incorrect email or password.",
  invalid_totp_code:
    "That code is not valid. Check your authenticator app and try again.",
  challenge_expired: "That code expired. We generated a new one — try again.",
  factor_conflict:
    "A previous two-factor setup was left half-finished. Start Over to get a new QR code.",
  mfa_not_enabled:
    "Two-factor authentication is not enabled for this project. Contact the platform team.",
  too_many_factors:
    "This account has too many two-factor devices enrolled. Contact the platform team.",
  rate_limited: "Too many attempts. Wait a moment and try again.",
  network:
    "We could not reach the authentication service. Check your connection.",
  unknown: "Something went wrong while signing you in. Please try again.",
};

const KIND_BY_CODE: Record<string, AdminAuthErrorKind> = {
  invalid_credentials: "invalid_credentials",
  email_not_confirmed: "invalid_credentials",
  user_not_found: "invalid_credentials",
  mfa_verification_failed: "invalid_totp_code",
  mfa_verification_rejected: "invalid_totp_code",
  mfa_challenge_expired: "challenge_expired",
  otp_expired: "challenge_expired",
  mfa_factor_name_conflict: "factor_conflict",
  mfa_verified_factor_exists: "factor_conflict",
  mfa_factor_not_found: "factor_conflict",
  mfa_totp_enroll_not_enabled: "mfa_not_enabled",
  mfa_totp_verify_not_enabled: "mfa_not_enabled",
  too_many_enrolled_mfa_factors: "too_many_factors",
  over_request_rate_limit: "rate_limited",
};

function classify(error: unknown): AdminAuthErrorKind {
  if (isAuthRetryableFetchError(error)) {
    return "network";
  }

  if (!isAuthError(error)) {
    return "unknown";
  }

  const byCode = error.code ? KIND_BY_CODE[error.code] : undefined;
  if (byCode) {
    return byCode;
  }

  if (error.status === 429) {
    return "rate_limited";
  }

  return "unknown";
}

/**
 * Maps any thrown value to a stable kind plus user-facing copy.
 *
 * Never surfaces the raw Supabase message: those leak implementation detail and
 * are not written for end users.
 */
export function toAdminAuthError(error: unknown): AdminAuthError {
  const kind = classify(error);
  return { kind, message: MESSAGES[kind] };
}

import { describe, expect, it } from "vitest";
import { AuthApiError, AuthRetryableFetchError } from "@supabase/supabase-js";
import { toAdminAuthError } from "@/features/admin-auth/utils/admin-auth-error";

describe("toAdminAuthError", () => {
  it("maps invalid credentials", () => {
    const result = toAdminAuthError(
      new AuthApiError("Invalid login credentials", 400, "invalid_credentials"),
    );

    expect(result.kind).toBe("invalid_credentials");
    expect(result.message).toBe("Incorrect email or password.");
  });

  it("maps a failed mfa verification", () => {
    expect(
      toAdminAuthError(
        new AuthApiError("Invalid TOTP code", 422, "mfa_verification_failed"),
      ).kind,
    ).toBe("invalid_totp_code");
  });

  it("maps an expired challenge separately from an invalid code", () => {
    expect(
      toAdminAuthError(
        new AuthApiError("expired", 422, "mfa_challenge_expired"),
      ).kind,
    ).toBe("challenge_expired");
  });

  it("maps a duplicate factor name to a conflict", () => {
    expect(
      toAdminAuthError(
        new AuthApiError("conflict", 422, "mfa_factor_name_conflict"),
      ).kind,
    ).toBe("factor_conflict");
  });

  it("maps a disabled totp provider", () => {
    expect(
      toAdminAuthError(
        new AuthApiError("disabled", 422, "mfa_totp_enroll_not_enabled"),
      ).kind,
    ).toBe("mfa_not_enabled");
  });

  it("maps the rate-limit code", () => {
    expect(
      toAdminAuthError(
        new AuthApiError("slow down", 429, "over_request_rate_limit"),
      ).kind,
    ).toBe("rate_limited");
  });

  it("falls back to the 429 status when no code is present", () => {
    expect(
      toAdminAuthError(new AuthApiError("slow down", 429, undefined)).kind,
    ).toBe("rate_limited");
  });

  it("maps a retryable fetch failure to network", () => {
    expect(
      toAdminAuthError(new AuthRetryableFetchError("offline", 0)).kind,
    ).toBe("network");
  });

  it("returns unknown for non-auth values", () => {
    expect(toAdminAuthError(new Error("boom")).kind).toBe("unknown");
    expect(toAdminAuthError("boom").kind).toBe("unknown");
    expect(toAdminAuthError(null).kind).toBe("unknown");
  });

  it("never leaks the raw supabase message", () => {
    expect(
      toAdminAuthError(
        new AuthApiError("Invalid login credentials", 400, "invalid_credentials"),
      ).message,
    ).not.toContain("Invalid login credentials");
  });
});

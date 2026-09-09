"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
  ADMIN_TOTP_FRIENDLY_NAME,
  ADMIN_TOTP_ISSUER,
} from "@/features/admin-auth/constants/admin-auth.constants";
import { toAdminAuthError } from "@/features/admin-auth/utils/admin-auth-error";
import type {
  AdminMfaChallenge,
  AdminTotpEnrollment,
  AdminTotpFactors,
} from "@/features/admin-auth/types/admin-auth.types";

export class AdminAuthError extends Error {
  constructor(
    readonly kind: ReturnType<typeof toAdminAuthError>["kind"],
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

function fail(error: unknown): never {
  const { kind, message } = toAdminAuthError(error);
  throw new AdminAuthError(kind, message, error);
}

/**
 * Browser-side Supabase auth I/O for the /admin login flow.
 *
 * Every method unwraps `{ data, error }` and throws an `AdminAuthError`, so
 * hooks only ever handle one error shape.
 *
 * There is intentionally no sign-up method: admin accounts are created directly
 * in the database.
 */
export class AdminAuthService {
  #client: SupabaseClient | null = null;

  /**
   * Lazily created so an accidental import from a Server Component does not
   * blow up at module-evaluation time reaching for `document.cookie`.
   */
  private get client(): SupabaseClient {
    this.#client ??= createSupabaseBrowserClient();
    return this.#client;
  }

  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<{ userId: string; email: string }> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      fail(error);
    }

    return { userId: data.user.id, email: data.user.email ?? "" };
  }

  /**
   * Verified TOTP factors plus any unverified leftovers.
   *
   * `data.totp` is typed as verified-only by the SDK; unverified factors are
   * derived from `data.all`. Never infer "has TOTP" from `nextLevel === "aal2"`
   * — unverified factors do not raise it.
   */
  async listTotpFactors(): Promise<AdminTotpFactors> {
    const { data, error } = await this.client.auth.mfa.listFactors();

    if (error || !data) {
      fail(error);
    }

    const verified = data.totp.map((factor) => ({ id: factor.id }));
    const verifiedIds = new Set(verified.map((factor) => factor.id));
    const unverified = data.all
      .filter(
        (factor) =>
          factor.factor_type === "totp" && !verifiedIds.has(factor.id),
      )
      .map((factor) => ({ id: factor.id }));

    return { verified, unverified };
  }

  async challengeFactor(factorId: string): Promise<AdminMfaChallenge> {
    const { data, error } = await this.client.auth.mfa.challenge({ factorId });

    if (error || !data) {
      fail(error);
    }

    return { factorId, challengeId: data.id, expiresAt: data.expires_at };
  }

  /**
   * Enrolls a fresh TOTP factor.
   *
   * Pre-existing *unverified* factors are unenrolled first because (a)
   * `mfa.enroll` rejects a duplicate friendly name with 422, and (b) the
   * secret and QR code are only ever returned at enroll time, so a stale
   * unverified factor cannot be displayed and must be discarded rather than
   * reused. This is the "user abandoned enrollment" path.
   */
  async enrollTotp(): Promise<{ factorId: string } & AdminTotpEnrollment> {
    await this.#unenrollUnverifiedFactors();

    const first = await this.client.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: ADMIN_TOTP_FRIENDLY_NAME,
      issuer: ADMIN_TOTP_ISSUER,
    });

    if (!first.error && first.data && "totp" in first.data) {
      return {
        factorId: first.data.id,
        uri: first.data.totp.uri,
        secret: first.data.totp.secret,
      };
    }

    // A conflict here means a factor appeared between the list and the enroll
    // (or the listing missed it). Clear once more and retry exactly once.
    if (toAdminAuthError(first.error).kind !== "factor_conflict") {
      fail(first.error);
    }

    await this.#unenrollUnverifiedFactors();

    const retry = await this.client.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: ADMIN_TOTP_FRIENDLY_NAME,
      issuer: ADMIN_TOTP_ISSUER,
    });

    if (retry.error || !retry.data) {
      fail(retry.error);
    }

    if (!("totp" in retry.data)) {
      fail(retry.error);
    }

    return {
      factorId: retry.data.id,
      uri: retry.data.totp.uri,
      secret: retry.data.totp.secret,
    };
  }

  async verifyFactor(
    factorId: string,
    challengeId: string,
    code: string,
  ): Promise<void> {
    const { error } = await this.client.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (error) {
      fail(error);
    }
  }

  async getAssuranceLevel(): Promise<{
    currentLevel: string | null;
    nextLevel: string | null;
  }> {
    const { data, error } =
      await this.client.auth.mfa.getAuthenticatorAssuranceLevel();

    if (error || !data) {
      fail(error);
    }

    return { currentLevel: data.currentLevel, nextLevel: data.nextLevel };
  }

  /**
   * `global` is the right default for a backoffice: signing out kills the
   * session on every device. Please don't "fix" this to `local`.
   */
  async signOut(scope: "global" | "local" = "global"): Promise<void> {
    const { error } = await this.client.auth.signOut({ scope });

    if (error) {
      fail(error);
    }
  }

  /** Best-effort sign-out for cleanup paths that must not mask the real error. */
  async signOutQuietly(scope: "global" | "local" = "local"): Promise<void> {
    await this.client.auth.signOut({ scope }).catch(() => undefined);
  }

  async #unenrollUnverifiedFactors(): Promise<void> {
    const { unverified } = await this.listTotpFactors();

    for (const factor of unverified) {
      await this.client.auth.mfa
        .unenroll({ factorId: factor.id })
        .catch(() => undefined);
    }
  }
}

export const adminAuthService = new AdminAuthService();

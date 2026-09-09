"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  adminAuthService,
  AdminAuthError,
} from "@/features/admin-auth/services/admin-auth.service";
import { sanitizeAdminRedirect } from "@/features/admin-auth/utils/admin-redirect";
import { matchesAllowedEmailDomain } from "@/features/admin-auth/utils/email-domain";
import { toAdminAuthError } from "@/features/admin-auth/utils/admin-auth-error";
import {
  isAdminSessionRejectionReason,
  type AdminLoginStep,
  type AdminSessionRejectionReason,
} from "@/features/admin-auth/types/admin-auth.types";
import {
  adminForbiddenDomainMessage,
  type AdminCredentialsFormData,
} from "@/features/admin-auth/schemas/admin-credentials.schema";
import type { AdminMfaFormData } from "@/features/admin-auth/schemas/admin-mfa.schema";

const REJECTION_COPY: Record<AdminSessionRejectionReason, string> = {
  unauthenticated: "Sign in to continue.",
  mfa_required: "Complete two-factor authentication to continue.",
  forbidden_domain: "That account is not allowed in the backoffice.",
  not_an_admin: "Your account does not have backoffice access.",
};

/** Reasons that mean the credential itself is unusable — start clean. */
const HARD_REJECTIONS: readonly AdminSessionRejectionReason[] = [
  "forbidden_domain",
  "not_an_admin",
];

type UseAdminLoginOptions = {
  allowedEmailDomain: string;
};

function describe(error: unknown): string {
  if (error instanceof AdminAuthError) {
    return error.message;
  }

  return toAdminAuthError(error).message;
}

/**
 * Orchestrates the multi-step /admin login: credentials, then either a TOTP
 * challenge or first-time TOTP enrollment, then the verified session.
 *
 * Holds no form state of its own — each step mounts its own form hook, so no
 * hook is ever called conditionally (which matters with the React Compiler on).
 */
export function useAdminLogin({ allowedEmailDomain }: UseAdminLoginOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<AdminLoginStep>({ kind: "credentials" });
  const [isBusy, setIsBusy] = useState(false);

  const redirectPath = sanitizeAdminRedirect(searchParams.get("redirect"));
  const rawReason = searchParams.get("reason");
  const rejectionReason = isAdminSessionRejectionReason(rawReason)
    ? rawReason
    : null;

  // Mirrors the wallet login's session-expired toast. Also clears any surviving
  // cookie for the rejections that mean "this account may not be here at all".
  useEffect(() => {
    if (!rejectionReason) {
      return;
    }

    // A stable id keeps Strict Mode's double-invoked effect from stacking two
    // identical toasts.
    toast.info("Backoffice access required", {
      id: `admin-rejection-${rejectionReason}`,
      description: REJECTION_COPY[rejectionReason],
    });

    if (HARD_REJECTIONS.includes(rejectionReason)) {
      void adminAuthService.signOutQuietly("global");
    }
  }, [rejectionReason]);

  /** Picks the MFA step: challenge an existing factor, or enroll a new one. */
  const startMfa = useCallback(async (): Promise<AdminLoginStep> => {
    const { verified } = await adminAuthService.listTotpFactors();

    const existing = verified[0];
    if (existing) {
      const challenge = await adminAuthService.challengeFactor(existing.id);
      return { kind: "mfa_challenge", ...challenge };
    }

    // Enrolling at aal1 is allowed; only verify elevates the session. Gating
    // enrollment behind aal2 would deadlock every first-time admin.
    const enrollment = await adminAuthService.enrollTotp();
    const challenge = await adminAuthService.challengeFactor(
      enrollment.factorId,
    );

    return {
      kind: "mfa_enroll",
      ...challenge,
      uri: enrollment.uri,
      secret: enrollment.secret,
    };
  }, []);

  const submitCredentials = useCallback(
    async (values: AdminCredentialsFormData) => {
      setIsBusy(true);

      try {
        const result = await adminAuthService.signInWithPassword(
          values.email,
          values.password,
        );

        // Re-check against what the server actually returned. The form-level
        // check is UX; an account could exist with a foreign domain.
        if (!matchesAllowedEmailDomain(result.email, allowedEmailDomain)) {
          await adminAuthService.signOutQuietly("global");
          toast.error("Access denied", {
            description: adminForbiddenDomainMessage(allowedEmailDomain),
          });
          return;
        }

        setStep(await startMfa());
      } catch (error) {
        toast.error("Sign in failed", { description: describe(error) });
        await adminAuthService.signOutQuietly("local");
        setStep({ kind: "credentials" });
      } finally {
        setIsBusy(false);
      }
    },
    [allowedEmailDomain, startMfa],
  );

  const submitCode = useCallback(
    async (values: AdminMfaFormData) => {
      if (step.kind !== "mfa_challenge" && step.kind !== "mfa_enroll") {
        return;
      }

      const { factorId, challengeId } = step;
      setIsBusy(true);
      let navigatedAway = false;

      try {
        await adminAuthService.verifyFactor(factorId, challengeId, values.code);

        // Keep the MFA form mounted with the submit button loading until the
        // navigation unmounts this view — do not flip to a full-page spinner.
        navigatedAway = true;
        router.replace(redirectPath);
        router.refresh();
      } catch (error) {
        const kind =
          error instanceof AdminAuthError
            ? error.kind
            : toAdminAuthError(error).kind;

        toast.error("Verification failed", { description: describe(error) });

        // An expired challenge is not a wrong code: issue a fresh one and keep
        // the user on the same step instead of blaming their authenticator.
        if (kind === "challenge_expired") {
          try {
            const challenge = await adminAuthService.challengeFactor(factorId);
            setStep({ ...step, ...challenge });
            return;
          } catch {
            // Fall through to the hard reset below.
          }
        }

        if (kind === "invalid_totp_code" || kind === "rate_limited") {
          return;
        }

        await adminAuthService.signOutQuietly("local");
        setStep({ kind: "credentials" });
      } finally {
        if (!navigatedAway) {
          setIsBusy(false);
        }
      }
    },
    [redirectPath, router, step],
  );

  const restart = useCallback(async () => {
    await adminAuthService.signOutQuietly("local");
    setStep({ kind: "credentials" });
  }, []);

  return {
    step,
    isBusy,
    allowedEmailDomain,
    submitCredentials,
    submitCode,
    restart,
  };
}

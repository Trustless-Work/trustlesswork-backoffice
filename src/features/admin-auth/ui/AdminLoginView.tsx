"use client";

import { AuthPageLayout } from "@/components/shared/AuthPageLayout";
import { useAdminLogin } from "@/features/admin-auth/hooks/useAdminLogin";
import { AdminCredentialsForm } from "@/features/admin-auth/ui/AdminCredentialsForm";
import { AdminMfaChallengeForm } from "@/features/admin-auth/ui/AdminMfaChallengeForm";
import { AdminMfaEnrollForm } from "@/features/admin-auth/ui/AdminMfaEnrollForm";

type AdminLoginViewProps = {
  /** Server-only value, handed down so the form can validate before submitting. */
  allowedEmailDomain: string;
};

const HEADINGS = {
  credentials: "Sign in to the Backoffice",
  mfa_challenge: "Two-factor authentication",
  mfa_enroll: "Set up two-factor",
} as const;

export const AdminLoginView = ({ allowedEmailDomain }: AdminLoginViewProps) => {
  const { step, isBusy, submitCredentials, submitCode, restart } = useAdminLogin(
    { allowedEmailDomain },
  );

  const descriptions = {
    credentials: `Use your @${allowedEmailDomain} account.`,
    mfa_challenge: "Enter the 6-digit code from your authenticator app.",
    mfa_enroll: "Scan the QR, then enter the 6-digit code.",
  } as const;

  return (
    <AuthPageLayout>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-wide">
          {HEADINGS[step.kind]}
        </h1>
        <p className="text-sm text-muted-foreground">
          {descriptions[step.kind]}
        </p>
      </div>

      {step.kind === "credentials" ? (
        <AdminCredentialsForm
          allowedEmailDomain={allowedEmailDomain}
          isSubmitting={isBusy}
          onSubmitCredentials={submitCredentials}
        />
      ) : null}

      {step.kind === "mfa_challenge" ? (
        <AdminMfaChallengeForm
          isSubmitting={isBusy}
          onSubmitCode={submitCode}
          onRestart={() => {
            void restart();
          }}
        />
      ) : null}

      {step.kind === "mfa_enroll" ? (
        <AdminMfaEnrollForm
          uri={step.uri}
          secret={step.secret}
          isSubmitting={isBusy}
          onSubmitCode={submitCode}
          onRestart={() => {
            void restart();
          }}
        />
      ) : null}

      {step.kind === "credentials" ? (
        <p className="text-sm text-muted-foreground">
          Backoffice access is granted by the platform team. Contact them if you
          cannot sign in.
        </p>
      ) : null}
    </AuthPageLayout>
  );
};

"use client";

import { ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { OtpCodeField } from "@/components/ui/otp-code-field";
import { Spinner } from "@/components/ui/spinner";
import { ADMIN_TOTP_CODE_LENGTH } from "@/features/admin-auth/constants/admin-auth.constants";
import { useAdminMfaForm } from "@/features/admin-auth/hooks/useAdminMfaForm";
import type { AdminMfaFormData } from "@/features/admin-auth/schemas/admin-mfa.schema";

type AdminMfaChallengeFormProps = {
  isSubmitting: boolean;
  onSubmitCode: (values: AdminMfaFormData) => Promise<void>;
  onRestart: () => void;
};

export const AdminMfaChallengeForm = ({
  isSubmitting,
  onSubmitCode,
  onRestart,
}: AdminMfaChallengeFormProps) => {
  const { form, onSubmit, handleComplete } = useAdminMfaForm({ onSubmitCode });

  return (
    <div className="flex flex-col gap-3">
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <OtpCodeField
            control={form.control}
            name="code"
            length={ADMIN_TOTP_CODE_LENGTH}
            disabled={isSubmitting}
            autoFocus
            onComplete={handleComplete}
          />

          <Button
            className="w-full"
            type="submit"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheckIcon data-icon="inline-start" />
                Verify
              </>
            )}
          </Button>
        </form>
      </Form>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-center"
        onClick={onRestart}
        disabled={isSubmitting}
      >
        Start Over
      </Button>
    </div>
  );
};

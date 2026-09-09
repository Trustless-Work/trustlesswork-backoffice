"use client";

import { ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Form } from "@/components/ui/form";
import { OtpCodeField } from "@/components/ui/otp-code-field";
import { Spinner } from "@/components/ui/spinner";
import { ADMIN_TOTP_CODE_LENGTH } from "@/features/admin-auth/constants/admin-auth.constants";
import { useAdminMfaForm } from "@/features/admin-auth/hooks/useAdminMfaForm";
import { AdminTotpQrCode } from "@/features/admin-auth/ui/AdminTotpQrCode";
import { AdminTotpSecretField } from "@/features/admin-auth/ui/AdminTotpSecretField";
import type { AdminMfaFormData } from "@/features/admin-auth/schemas/admin-mfa.schema";

type AdminMfaEnrollFormProps = {
  uri: string;
  secret: string;
  isSubmitting: boolean;
  onSubmitCode: (values: AdminMfaFormData) => Promise<void>;
  onRestart: () => void;
};

export const AdminMfaEnrollForm = ({
  uri,
  secret,
  isSubmitting,
  onSubmitCode,
  onRestart,
}: AdminMfaEnrollFormProps) => {
  const { form, onSubmit, handleComplete } = useAdminMfaForm({ onSubmitCode });

  return (
    <div className="flex flex-col gap-3">
      <AdminTotpQrCode uri={uri} secret={secret} />

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="link"
            className="mx-auto h-auto p-0 text-muted-foreground"
          >
            Can&apos;t scan?
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <AdminTotpSecretField secret={secret} />
        </CollapsibleContent>
      </Collapsible>

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
                Confirming...
              </>
            ) : (
              <>
                <ShieldCheckIcon data-icon="inline-start" />
                Confirm
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

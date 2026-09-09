"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  adminForbiddenDomainMessage,
  createAdminCredentialsSchema,
  type AdminCredentialsFormData,
} from "@/features/admin-auth/schemas/admin-credentials.schema";
import {
  extractEmailDomain,
  matchesAllowedEmailDomain,
} from "@/features/admin-auth/utils/email-domain";

type UseAdminCredentialsFormOptions = {
  allowedEmailDomain: string;
  onSubmitCredentials: (values: AdminCredentialsFormData) => Promise<void>;
};

export function useAdminCredentialsForm({
  allowedEmailDomain,
  onSubmitCredentials,
}: UseAdminCredentialsFormOptions) {
  const schema = useMemo(
    () => createAdminCredentialsSchema(allowedEmailDomain),
    [allowedEmailDomain],
  );

  const form = useForm<AdminCredentialsFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(
    async (values) => {
      await onSubmitCredentials(values);
    },
    () => {
      const email = form.getValues("email");
      const hasDomain = extractEmailDomain(email) !== null;
      if (
        hasDomain &&
        !matchesAllowedEmailDomain(email, allowedEmailDomain)
      ) {
        toast.error("Access denied", {
          description: adminForbiddenDomainMessage(allowedEmailDomain),
        });
      }
    },
  );

  return { form, onSubmit };
}

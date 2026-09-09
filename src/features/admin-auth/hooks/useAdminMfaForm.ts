"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  adminMfaSchema,
  type AdminMfaFormData,
} from "@/features/admin-auth/schemas/admin-mfa.schema";

type UseAdminMfaFormOptions = {
  onSubmitCode: (values: AdminMfaFormData) => Promise<void>;
};

export function useAdminMfaForm({ onSubmitCode }: UseAdminMfaFormOptions) {
  const form = useForm<AdminMfaFormData>({
    resolver: zodResolver(adminMfaSchema),
    defaultValues: {
      code: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await onSubmitCode(values);
    // Clear the field so a rejected code does not linger in the slots.
    form.reset({ code: "" });
  });

  /**
   * Auto-submits once the last slot is filled. `onComplete` can fire twice
   * (last keystroke plus a paste), so the in-flight submission is the guard.
   */
  const handleComplete = useCallback(() => {
    if (form.formState.isSubmitting) {
      return;
    }

    void onSubmit();
  }, [form.formState.isSubmitting, onSubmit]);

  return { form, onSubmit, handleComplete };
}

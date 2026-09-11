"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormData,
} from "@/features/auth/schemas/register.schema";
import type { RegisterProfileInput } from "@/features/auth/types/auth.types";

type UseRegisterFormOptions = {
  onRegister: (profile: RegisterProfileInput) => Promise<void>;
  isSubmitting: boolean;
};

export function useRegisterForm({
  onRegister,
  isSubmitting,
}: UseRegisterFormOptions) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      organizationName: "",
      email: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const profile: RegisterProfileInput = {
      firstName: values.firstName.trim(),
      email: values.email.trim(),
      organizationName: values.organizationName.trim(),
      lastName: values.lastName.trim() || undefined,
    };

    await onRegister(profile);
  });

  return {
    form,
    onSubmit,
    isSubmitting,
  };
}

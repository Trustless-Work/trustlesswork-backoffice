"use client";

import { AtSignIcon, LockIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { AuthDivider } from "@/components/ui/auth-divider";
import { useAdminCredentialsForm } from "@/features/admin-auth/hooks/useAdminCredentialsForm";
import type { AdminCredentialsFormData } from "@/features/admin-auth/schemas/admin-credentials.schema";

type AdminCredentialsFormProps = {
  allowedEmailDomain: string;
  isSubmitting: boolean;
  onSubmitCredentials: (values: AdminCredentialsFormData) => Promise<void>;
};

export const AdminCredentialsForm = ({
  allowedEmailDomain,
  isSubmitting,
  onSubmitCredentials,
}: AdminCredentialsFormProps) => {
  const { form, onSubmit } = useAdminCredentialsForm({
    allowedEmailDomain,
    onSubmitCredentials,
  });

  return (
    <Form {...form}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <AtSignIcon />
                </InputGroupAddon>
                <FormControl>
                  <InputGroupInput
                    {...field}
                    placeholder={`name@${allowedEmailDomain}`}
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    spellCheck={false}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </InputGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password <span className="text-destructive">*</span>
              </FormLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <LockIcon />
                </InputGroupAddon>
                <FormControl>
                  <InputGroupInput
                    {...field}
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                    spellCheck={false}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </InputGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <AuthDivider>Two-factor required</AuthDivider>

        <Button
          className="w-full"
          type="submit"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner data-icon="inline-start" />
              Signing in...
            </>
          ) : (
            <>
              <ShieldCheckIcon data-icon="inline-start" />
              Continue
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

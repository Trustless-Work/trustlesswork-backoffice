"use client";

import { AtSignIcon, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";
import type { RegisterProfileInput } from "@/features/auth/types/auth.types";
import { formatAddress } from "@/helpers/format.helper";

type RegisterFormProps = {
  walletAddress: string;
  onRegister: (profile: RegisterProfileInput) => Promise<void>;
  onTryDifferentWallet: () => void;
  isSubmitting: boolean;
};

export const RegisterForm = ({
  walletAddress,
  onRegister,
  onTryDifferentWallet,
  isSubmitting,
}: RegisterFormProps) => {
  const { form, onSubmit } = useRegisterForm({
    onRegister,
    isSubmitting,
  });

  return (
    <div className="flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Jane"
                      autoComplete="given-name"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Doe"
                      autoComplete="family-name"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Organization <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Acme Labs"
                      autoComplete="organization"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        placeholder="name@example.com"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        spellCheck={false}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </InputGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            className="w-full"
            type="submit"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Wallet data-icon="inline-start" />
                Create Account with {formatAddress(walletAddress, 3)}
              </>
            )}
          </Button>
        </form>
      </Form>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onTryDifferentWallet}
        disabled={isSubmitting}
      >
        Try a different wallet
      </Button>
    </div>
  );
};

"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type OtpCodeFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
};

/**
 * Generic react-hook-form field for a one-time code.
 *
 * Sizing and colors come from `input-otp.tsx` (radix-luma: `size-8`,
 * `rounded-lg`, `border-input`) — only layout classes belong here.
 */
export function OtpCodeField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  length = 6,
  disabled,
  autoFocus,
  onComplete,
}: OtpCodeFieldProps<TFieldValues>) {
  const half = Math.ceil(length / 2);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="items-center text-center">
          {label ? <FormLabel>{label}</FormLabel> : null}

          {/* FormControl renders a Slot, so it must have exactly one child. */}
          <FormControl>
            <InputOTP
              maxLength={length}
              pattern={REGEXP_ONLY_DIGITS}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus={autoFocus}
              disabled={disabled}
              containerClassName="justify-center gap-2"
              name={field.name}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              onComplete={onComplete}
            >
              <InputOTPGroup>
                {Array.from({ length: half }, (_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    aria-invalid={fieldState.invalid}
                  />
                ))}
              </InputOTPGroup>

              <InputOTPSeparator />

              <InputOTPGroup>
                {Array.from({ length: length - half }, (_, offset) => (
                  <InputOTPSlot
                    key={half + offset}
                    index={half + offset}
                    aria-invalid={fieldState.invalid}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </FormControl>

          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

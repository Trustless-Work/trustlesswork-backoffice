import { z } from "zod/v3";
import { ADMIN_TOTP_CODE_LENGTH } from "@/features/admin-auth/constants/admin-auth.constants";

export const adminMfaSchema = z.object({
  code: z
    .string()
    .trim()
    // Authenticator apps display "123 456"; pasting that should just work.
    .transform((value) => value.replace(/\s+/g, ""))
    .refine((value) => value.length === ADMIN_TOTP_CODE_LENGTH, {
      message: `Enter the ${ADMIN_TOTP_CODE_LENGTH}-digit code`,
    })
    .refine((value) => /^\d+$/.test(value), {
      message: "The code must be digits only",
    }),
});

export type AdminMfaFormData = z.infer<typeof adminMfaSchema>;

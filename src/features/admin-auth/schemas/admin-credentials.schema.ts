import { z } from "zod/v3";
import { matchesAllowedEmailDomain } from "@/features/admin-auth/utils/email-domain";

export function adminForbiddenDomainMessage(allowedDomain: string): string {
  return `Only Trustless Work staff can access the backoffice. Use your @${allowedDomain} account.`;
}

/**
 * A factory rather than a module constant because the allowed domain is a
 * server-only value handed to the client as a prop.
 *
 * The domain check here is UX only — it keeps a wrong account from ever hitting
 * the network. The authoritative gates are the middleware, the RSC guard and
 * Postgres RLS.
 */
export function createAdminCredentialsSchema(allowedDomain: string) {
  return z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email is required")
      .email("Enter a valid email address (e.g. name@example.com)")
      .refine((value) => matchesAllowedEmailDomain(value, allowedDomain), {
        message: adminForbiddenDomainMessage(allowedDomain),
      }),
    password: z.string().min(1, "Password is required"),
  });
}

export type AdminCredentialsSchema = ReturnType<
  typeof createAdminCredentialsSchema
>;

export type AdminCredentialsFormData = z.infer<AdminCredentialsSchema>;

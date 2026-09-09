import type { ServerEnvConfig } from "@/lib/env/server-env-schema";

/**
 * Auth policy for the /admin area (Supabase email + password + TOTP).
 *
 * Distinct from `ApiEnv.adminApiKey`, which is the core-API operator key used
 * by `admin-fetch.ts` and unrelated to this feature.
 *
 * The allowed domain is server-only on purpose: NEXT_PUBLIC_* values are
 * inlined at build time, so a public twin would need a redeploy to change and
 * could drift from what the server actually enforces. The admin login page is
 * a Server Component and passes this value down as a prop for form-level UX.
 */
export class AdminAuthEnv {
  constructor(private readonly config: ServerEnvConfig) {}

  /** Single allowed email domain, lowercase, without a leading "@". */
  get allowedEmailDomain(): string {
    return this.config.ADMIN_ALLOWED_EMAIL_DOMAIN.trim().toLowerCase();
  }
}

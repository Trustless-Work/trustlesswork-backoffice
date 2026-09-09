import type { ClientEnvConfig } from "@/lib/env/client-env-schema";

/**
 * Supabase project URL + publishable key for the /admin area.
 *
 * Both values are public by design: the browser client cannot exist without
 * them, and the server client uses the exact same pair. They are declared in
 * the client schema and read from every runtime (browser client, server
 * client, edge middleware).
 *
 * This is NOT the "server var falling back to NEXT_PUBLIC_*" pattern that
 * ENV.mdc forbids (that would be `process.env.SECRET ?? process.env.NEXT_PUBLIC_SECRET`).
 * @t3-oss/env only guards the server -> client direction; reading a client key
 * from server code is supported. Please don't "fix" this into a duplicate
 * server-side declaration.
 *
 * The privileged service-role key is deliberately absent: admin data access
 * goes through RLS with the publishable key.
 */
export class SupabaseEnv {
  constructor(private readonly config: ClientEnvConfig) {}

  get url(): string {
    return this.config.NEXT_PUBLIC_SUPABASE_URL;
  }

  get publishableKey(): string {
    return this.config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  }
}

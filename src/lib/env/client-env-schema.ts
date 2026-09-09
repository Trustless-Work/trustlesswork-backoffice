import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const clientEnvSchema = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1).optional(),
    // `.url()` alone accepts any scheme, including the `postgresql://`
    // connection string — which would also leak the database password into the
    // client bundle. Require the REST endpoint explicitly so a wrong value
    // fails at boot with an actionable message instead of inside middleware.
    NEXT_PUBLIC_SUPABASE_URL: z
      .string()
      .url()
      .refine((value) => /^https?:\/\//i.test(value), {
        message:
          "NEXT_PUBLIC_SUPABASE_URL must be the Supabase Project URL (https://<ref>.supabase.co), not the database connection string",
      }),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
      .string()
      .min(1)
      .refine((value) => !value.includes("://"), {
        message:
          "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be the publishable (anon) key, not a URL or connection string",
      }),
  },
  runtimeEnv: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

export type ClientEnvConfig = typeof clientEnvSchema;

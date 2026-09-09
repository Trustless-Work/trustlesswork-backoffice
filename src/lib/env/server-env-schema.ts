import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverEnvSchema = createEnv({
  server: {
    SESSION_SECRET: z.string().min(32),
    CORE_API_URL: z.string().url(),
    BACKOFFICE_ADMIN_API_KEY: z.string().min(1).optional(),
    ADMIN_ALLOWED_EMAIL_DOMAIN: z
      .string()
      .trim()
      .min(3)
      .regex(
        /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/,
        "ADMIN_ALLOWED_EMAIL_DOMAIN must be a bare lowercase domain (e.g. trustlesswork.com), without a leading @",
      ),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  client: {},
  runtimeEnv: {
    SESSION_SECRET: process.env.SESSION_SECRET,
    CORE_API_URL: process.env.CORE_API_URL,
    BACKOFFICE_ADMIN_API_KEY: process.env.BACKOFFICE_ADMIN_API_KEY,
    ADMIN_ALLOWED_EMAIL_DOMAIN: process.env.ADMIN_ALLOWED_EMAIL_DOMAIN,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

export type ServerEnvConfig = typeof serverEnvSchema;

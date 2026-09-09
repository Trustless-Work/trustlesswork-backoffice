export const ADMIN_HOME_PATH = "/admin" as const;
export const ADMIN_LOGIN_PATH = "/admin/login" as const;

/**
 * Route handler that clears the Supabase session. Server Components cannot
 * write cookies, so the RSC guard redirects here instead of straight to the
 * login page when a session must be terminated.
 */
export const ADMIN_SIGN_OUT_PATH = "/api/admin-auth/sign-out" as const;

export const ADMIN_TOTP_FRIENDLY_NAME = "trustless-work-backoffice" as const;
export const ADMIN_TOTP_ISSUER = "Trustless Work Backoffice" as const;
export const ADMIN_TOTP_CODE_LENGTH = 6;

/**
 * Platform user table in the `public` schema.
 *
 * Shared with the core API, so treat it as read-only from here. Its `id` is a
 * bigint unrelated to the Supabase Auth uuid, which is why the backoffice joins
 * the two by email — see `ADMIN_USERS_MATCH_COLUMN`.
 */
export const ADMIN_USERS_TABLE = "users" as const;

/**
 * The only link between a Supabase Auth identity and its platform row. There is
 * no `auth_user_id` column to join on; adding one would mean a migration to a
 * table the core API owns.
 */
export const ADMIN_USERS_MATCH_COLUMN = "email" as const;

/** Role in `public.users.roles` that grants backoffice access. */
export const ADMIN_REQUIRED_ROLE = "ADMIN" as const;

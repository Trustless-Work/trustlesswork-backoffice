import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ADMIN_REQUIRED_ROLE,
  ADMIN_USERS_MATCH_COLUMN,
  ADMIN_USERS_TABLE,
} from "@/features/admin-auth/constants/admin-auth.constants";
import type { AdminUserRow } from "@/features/admin-auth/types/admin-auth.types";

const SELECTED_COLUMNS = "id, email, roles, created_at";

export type AdminUserRowResult = {
  readonly data: unknown;
  readonly error: unknown;
};

/**
 * Fetches at most one `public.users` row by email.
 *
 * A callback rather than the `SupabaseClient` itself: PostgREST's builder types
 * are deeply generic, and structurally matching them against a narrow interface
 * makes TypeScript give up ("type instantiation is excessively deep"). It also
 * means tests need a one-line fake instead of a whole client.
 */
export type AdminUserRowFetcher = (
  email: string,
) => PromiseLike<AdminUserRowResult>;

/**
 * Binds the fetcher to a real Supabase client.
 *
 * `ilike` rather than `eq` because the stored email's casing is not guaranteed
 * to match the Supabase Auth one, and a case mismatch would silently lock out a
 * legitimate admin. `ilike` treats `%` and `_` as wildcards, so an address
 * containing `_` could match a *different* row — `findAdminByEmail` re-checks
 * exact equality afterwards to close that gap.
 *
 * `maybeSingle()` rather than `single()` so zero rows is a `null` instead of an
 * error. More than one match is an error, which denies access: an ambiguous
 * identity must never resolve to a privileged row.
 */
export function createAdminUserRowFetcher(
  client: SupabaseClient,
): AdminUserRowFetcher {
  return async (email) =>
    client
      .from(ADMIN_USERS_TABLE)
      .select(SELECTED_COLUMNS)
      .ilike(ADMIN_USERS_MATCH_COLUMN, email)
      .maybeSingle();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** `id` is a Postgres bigint, so PostgREST sends it as a number. */
function asEntityId(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function asRoles(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((role): role is string => typeof role === "string");
}

/**
 * Narrows the loosely-typed PostgREST row. `select()` returns `unknown`-shaped
 * data, and casting it with `as AdminUserRow` would be a lie about a value that
 * crosses a trust boundary.
 */
export function parseAdminUserRow(row: unknown): AdminUserRow | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const id = asEntityId(candidate.id);
  const email = asNullableString(candidate.email);

  if (id === null || email === null) {
    return null;
  }

  return {
    id,
    email,
    roles: asRoles(candidate.roles),
    createdAt: asNullableString(candidate.created_at),
  };
}

/** Role comparison is case- and whitespace-insensitive; the column is free text. */
export function hasAdminRole(row: AdminUserRow): boolean {
  return row.roles.some(
    (role) => role.trim().toUpperCase() === ADMIN_REQUIRED_ROLE,
  );
}

export class AdminUsersService {
  /**
   * Resolves the signed-in Supabase identity to its platform row, and only
   * returns it when that row carries the backoffice role.
   *
   * `public.users` has RLS disabled and is reachable with the publishable key,
   * so this read grants nothing on its own — it is the *caller* that must run
   * server-side with an email taken from a verified session, never from input.
   * See `admin-session.guard.ts`.
   *
   * "No row", "ambiguous match", "read failed" and "row without the role" all
   * collapse to `null`: the caller may not learn which backoffice accounts
   * exist.
   */
  async findAdminByEmail(
    fetchRow: AdminUserRowFetcher,
    email: string,
  ): Promise<AdminUserRow | null> {
    const normalized = normalizeEmail(email);
    if (normalized.length === 0) {
      return null;
    }

    const { data, error } = await fetchRow(normalized);

    if (error) {
      return null;
    }

    const row = parseAdminUserRow(data);
    if (row === null) {
      return null;
    }

    // Undo `ilike`'s wildcard leniency: the row must be the exact identity.
    if (normalizeEmail(row.email) !== normalized) {
      return null;
    }

    return hasAdminRole(row) ? row : null;
  }
}

export const adminUsersService = new AdminUsersService();

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env";

/**
 * Supabase client for the browser side of the /admin area.
 *
 * The `cookies` option is intentionally omitted: in a browser runtime
 * @supabase/ssr falls back to `document.cookie`, which is what we want.
 *
 * `cookieOptions.name` is also intentionally left at its default
 * (`sb-<project-ref>-auth-token`) so it can never collide with the wallet
 * flow's iron-session cookie (`tw_session`). Do not set it.
 *
 * `createBrowserClient` is a singleton by default, so calling this repeatedly
 * is cheap.
 */
export function createSupabaseBrowserClient(): SupabaseClient {
  return createBrowserClient(
    clientEnv.supabase.url,
    clientEnv.supabase.publishableKey,
  );
}

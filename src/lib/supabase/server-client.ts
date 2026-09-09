import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env";

/**
 * Per-request Supabase client for Server Components and route handlers.
 *
 * Never cache or share the returned client across requests.
 *
 * Next.js 16 notes:
 * - `cookies()` is async, hence the awaited factory.
 * - Server Components cannot mutate cookies, so `setAll` is best-effort there
 *   and the write throws. Token refresh therefore MUST happen in middleware
 *   (see `middleware-client.ts`), which is why the matcher covers every
 *   /admin path including /admin/login.
 * - Route handlers CAN write cookies through the same store, so this single
 *   factory serves both; the try/catch is what makes that safe.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    clientEnv.supabase.url,
    clientEnv.supabase.publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Middleware already refreshed the session for this navigation.
          }
        },
      },
    },
  );
}

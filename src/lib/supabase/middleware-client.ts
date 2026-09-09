import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env";

/**
 * Headers @supabase/ssr asks us to set whenever auth cookies are written.
 * Copied onto redirect responses by `applyAuthCookies`.
 */
const NO_STORE_HEADER_NAMES = new Set(["cache-control", "expires", "pragma"]);

export type SupabaseMiddlewareContext = {
  readonly supabase: SupabaseClient;
  /**
   * ALWAYS call this to obtain the pass-through response. `setAll` replaces the
   * internal response object, so capturing it by value would silently discard
   * refreshed auth cookies (which surfaces as random logouts).
   */
  getResponse: () => NextResponse;
  /**
   * Copies refreshed (or signOut-cleared) auth cookies and the no-store headers
   * onto another response. `NextResponse.redirect()` builds a *different*
   * object, so without this the browser keeps the stale cookies.
   */
  applyAuthCookies: (target: NextResponse) => NextResponse;
};

/**
 * Supabase client for edge middleware — the only layer that can write cookies,
 * and therefore the only place session refresh can happen.
 */
export function createSupabaseMiddlewareClient(
  request: NextRequest,
): SupabaseMiddlewareContext {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    clientEnv.supabase.url,
    clientEnv.supabase.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }

          // Responses that set auth cookies must not be cached by a CDN or
          // reverse proxy, otherwise one admin's session token can be served
          // to another. This second `setAll` argument carries those headers.
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  return {
    supabase,
    getResponse: () => response,
    applyAuthCookies: (target) => {
      for (const cookie of response.cookies.getAll()) {
        target.cookies.set(cookie);
      }

      for (const [key, value] of response.headers.entries()) {
        if (NO_STORE_HEADER_NAMES.has(key.toLowerCase())) {
          target.headers.set(key, value);
        }
      }

      return target;
    },
  };
}

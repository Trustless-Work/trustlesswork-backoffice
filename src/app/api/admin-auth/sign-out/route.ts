import { NextResponse, type NextRequest } from "next/server";
import { validateSameOrigin } from "@/lib/bff-utils";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ADMIN_LOGIN_PATH } from "@/features/admin-auth/constants/admin-auth.constants";
import { isAdminSessionRejectionReason } from "@/features/admin-auth/types/admin-auth.types";

/**
 * Terminates the Supabase session backing the /admin area.
 *
 * Named `admin-auth` to keep it clearly distinct from `/api/admin/*`, which is
 * the core-API operator proxy guarded by iron-session. This handler never
 * touches iron-session or wallet state.
 *
 * BFF_SECURITY checklist:
 * - Who can call it? Anyone. It only ever clears the caller's own cookies, so
 *   there is nothing to authorize; with no session it is a no-op.
 * - CSRF? `validateSameOrigin` on POST. GET exists because the RSC guard needs
 *   a redirect target that can write cookies, and a forced GET can only log the
 *   victim out of the backoffice — low severity, and accepted deliberately.
 * - Abuse smoke test: no cookie -> 303/204 with nothing cleared; a foreign
 *   origin POST -> 403.
 */

/** Route handlers can write cookies, unlike Server Components. */
async function clearAdminSession(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  // `signOut` clears every chunk of the auth cookie via `setAll`; deleting by
  // name is not possible because the chunk count is unknown.
  await supabase.auth.signOut({ scope: "global" }).catch(() => undefined);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  await clearAdminSession();

  const rawReason = request.nextUrl.searchParams.get("reason");
  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);

  if (isAdminSessionRejectionReason(rawReason)) {
    loginUrl.searchParams.set("reason", rawReason);
  }

  // 303 so the browser follows with a GET regardless of how it got here.
  return NextResponse.redirect(loginUrl, 303);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const originError = validateSameOrigin(request);
  if (originError) {
    return originError;
  }

  await clearAdminSession();

  return new NextResponse(null, { status: 204 });
}

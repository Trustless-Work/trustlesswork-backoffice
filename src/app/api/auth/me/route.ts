import { NextResponse } from "next/server";
import { identitySessionFetch } from "@/lib/identity-fetch";
import { clearSession, getSession, isSessionExpired } from "@/lib/session";
import { proxyCoreResponse } from "@/lib/bff-utils";
import type {
  SessionMeResponse,
  SessionStatusResponse,
  UserResponse,
} from "@/features/auth/types/auth.types";

export async function GET() {
  const session = await getSession();
  const { token, expiresAt } = session;

  if (!token || isSessionExpired(expiresAt)) {
    if (token) {
      await clearSession();
    }

    const body: SessionStatusResponse = {
      authenticated: false,
      expiresAt,
    };

    return NextResponse.json(body);
  }

  const meResponse = await identitySessionFetch("/users/me");

  if (meResponse.status === 401) {
    await clearSession();

    const body: SessionStatusResponse = {
      authenticated: false,
      expiresAt,
    };

    return NextResponse.json(body);
  }

  if (!meResponse.ok) {
    return proxyCoreResponse(meResponse);
  }

  const user = (await meResponse.json()) as UserResponse;
  const body: SessionMeResponse = {
    authenticated: true,
    expiresAt: expiresAt ?? "",
    user,
  };

  return NextResponse.json(body);
}

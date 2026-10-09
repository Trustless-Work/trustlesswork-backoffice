import { NextRequest, NextResponse } from "next/server";
import { coreFetch } from "@/lib/core-fetch";
import {
  clearSessionForNetwork,
  getSession,
  isSessionExpired,
  readNetworkSession,
} from "@/lib/session";
import { parseRequestNetwork } from "@/helpers/request-network.helper";
import type {
  SessionMeResponse,
  SessionStatusResponse,
  UserResponse,
} from "@/features/auth/types/auth.types";

export async function GET(request: NextRequest) {
  const network = parseRequestNetwork(request);
  const session = await getSession();
  const current = readNetworkSession(session, network);

  if (!current?.token || isSessionExpired(current.expiresAt)) {
    if (current?.token) {
      await clearSessionForNetwork(network);
    }

    const body: SessionStatusResponse = {
      authenticated: false,
      expiresAt: current?.expiresAt,
    };

    return NextResponse.json(body);
  }

  const meResponse = await coreFetch("/users/me", { network });

  if (!meResponse.ok) {
    await clearSessionForNetwork(network);

    const body: SessionStatusResponse = {
      authenticated: false,
      expiresAt: current.expiresAt,
    };

    return NextResponse.json(body, { status: meResponse.status });
  }

  const user = (await meResponse.json()) as UserResponse;
  const body: SessionMeResponse = {
    authenticated: true,
    expiresAt: current.expiresAt,
    user,
  };

  return NextResponse.json(body);
}

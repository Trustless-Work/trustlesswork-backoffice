import { NextRequest } from "next/server";
import { adminFetch } from "@/lib/admin-fetch";
import { setSessionToken } from "@/lib/session";
import { parseJsonBody, proxyCoreResponse } from "@/lib/bff-utils";
import { parseRequestNetwork } from "@/helpers/request-network.helper";
import type {
  AuthVerifyRequest,
  SessionVerifyResponse,
} from "@/features/auth/types/auth.types";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<AuthVerifyRequest>(request);
  const response = await adminFetch("/auth/session/verify", {
    method: "POST",
    body: JSON.stringify(body),
    network: parseRequestNetwork(request),
  });

  if (!response.ok) {
    return proxyCoreResponse(response);
  }

  const data = (await response.json()) as SessionVerifyResponse;
  await setSessionToken(
    data.token,
    data.expiresAt,
    parseRequestNetwork(request),
  );

  return proxyCoreResponse(
    new Response(JSON.stringify({ success: true, expiresAt: data.expiresAt }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

import { NextRequest } from "next/server";
import { identityOperatorFetch } from "@/lib/identity-fetch";
import { setSessionToken } from "@/lib/session";
import { parseJsonBody, proxyCoreResponse } from "@/lib/bff-utils";
import type {
  AuthVerifyRequest,
  SessionVerifyResponse,
} from "@/features/auth/types/auth.types";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<AuthVerifyRequest>(request);
  const response = await identityOperatorFetch("/auth/session/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return proxyCoreResponse(response);
  }

  const data = (await response.json()) as SessionVerifyResponse;
  await setSessionToken(data.token, data.expiresAt);

  return proxyCoreResponse(
    new Response(JSON.stringify({ success: true, expiresAt: data.expiresAt }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

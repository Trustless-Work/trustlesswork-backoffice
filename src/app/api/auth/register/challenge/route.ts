import { NextRequest } from "next/server";
import { adminFetch } from "@/lib/admin-fetch";
import { parseJsonBody, proxyCoreResponse } from "@/lib/bff-utils";
import { parseRequestNetwork } from "@/helpers/request-network.helper";
import type { AuthChallengeRequest } from "@/features/auth/types/auth.types";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<AuthChallengeRequest>(request);
  const response = await adminFetch("/auth/register/challenge", {
    method: "POST",
    body: JSON.stringify(body),
    network: parseRequestNetwork(request),
  });
  return proxyCoreResponse(response);
}

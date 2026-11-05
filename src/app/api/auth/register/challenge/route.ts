import { NextRequest } from "next/server";
import { identityOperatorFetch } from "@/lib/identity-fetch";
import { parseJsonBody, proxyCoreResponse } from "@/lib/bff-utils";
import type { AuthChallengeRequest } from "@/features/auth/types/auth.types";

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<AuthChallengeRequest>(request);
  const response = await identityOperatorFetch("/auth/register/challenge", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return proxyCoreResponse(response);
}

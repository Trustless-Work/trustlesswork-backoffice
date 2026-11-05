import { getSessionToken } from "@/lib/session";
import { createUnauthorizedResponse } from "@/lib/core-fetch";
import { serverEnv } from "@/lib/env";
import type { ProblemDetails } from "@/lib/api-error";

function createOperatorTokenMissingResponse(): Response {
  const body: ProblemDetails = {
    status: 503,
    code: "PLATFORM_CREDENTIAL_MISSING",
    title: "Service Unavailable",
    detail:
      "Identity operator token is not configured on the server (IDENTITY_OPERATOR_TOKEN).",
  };
  return Response.json(body, { status: 503 });
}

function identityRequest(
  path: string,
  bearer: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${serverEnv.api.identityApiUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${bearer}`);

  return fetch(url, { ...init, headers });
}

export async function identityOperatorFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = serverEnv.api.identityOperatorToken;
  if (!token) {
    return createOperatorTokenMissingResponse();
  }

  return identityRequest(path, token, init);
}

export async function identitySessionFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getSessionToken();
  if (!token) {
    return createUnauthorizedResponse();
  }

  return identityRequest(path, token, init);
}

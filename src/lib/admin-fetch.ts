import { serverEnv } from "@/lib/env";
import type { ProblemDetails } from "@/lib/api-error";
import type { NetworkType } from "@/types/network.entity";

export type AdminFetchInit = RequestInit & {
  readonly network?: NetworkType;
};

export function createAdminCredentialMissingResponse(): Response {
  const body: ProblemDetails = {
    status: 503,
    code: "PLATFORM_CREDENTIAL_MISSING",
    title: "Service Unavailable",
    detail: "Backoffice operator API key is not configured on the server",
  };
  return Response.json(body, { status: 503 });
}

export async function adminFetch(
  path: string,
  init?: AdminFetchInit,
): Promise<Response> {
  const apiKey = serverEnv.api.adminApiKey;
  if (!apiKey) {
    return createAdminCredentialMissingResponse();
  }

  const { network, ...fetchInit } = init ?? {};
  const url = `${serverEnv.api.coreApiUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(fetchInit.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("x-api-key", apiKey);
  if (network) {
    headers.set("x-network", network);
  }

  return fetch(url, {
    ...fetchInit,
    headers,
  });
}

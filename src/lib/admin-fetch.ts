import { serverEnv } from "@/lib/env";
import type { ProblemDetails } from "@/lib/api-error";
import type { NetworkType } from "@/types/network.entity";

export type AdminFetchInit = RequestInit & {
  readonly network?: NetworkType;
};

export function createAdminCredentialMissingResponse(
  network: NetworkType = "testnet",
): Response {
  const body: ProblemDetails = {
    status: 503,
    code: "PLATFORM_CREDENTIAL_MISSING",
    title: "Service Unavailable",
    detail:
      network === "mainnet"
        ? "Mainnet backoffice operator API key is not configured on the server (BACKOFFICE_ADMIN_API_KEY_MAINNET)."
        : "Backoffice operator API key is not configured on the server",
  };
  return Response.json(body, { status: 503 });
}

export async function adminFetch(
  path: string,
  init?: AdminFetchInit,
): Promise<Response> {
  const { network = "testnet", ...fetchInit } = init ?? {};
  const apiKey = serverEnv.api.adminApiKeyFor(network);
  const baseUrl = serverEnv.api.coreApiUrlFor(network);
  if (!apiKey || !baseUrl) {
    return createAdminCredentialMissingResponse(network);
  }

  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(fetchInit.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("x-api-key", apiKey);
  headers.set("x-network", network);

  return fetch(url, {
    ...fetchInit,
    headers,
  });
}

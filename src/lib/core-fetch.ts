import { getSessionToken } from "@/lib/session";
import { serverEnv } from "@/lib/env";
import type { ProblemDetails } from "@/lib/api-error";
import type { NetworkType } from "@/types/network.entity";

export type CoreFetchInit = RequestInit & {
  readonly network?: NetworkType;
};

export function createUnauthorizedResponse(): Response {
  const body: ProblemDetails = {
    status: 401,
    code: "AUTH_CREDENTIAL_MISSING",
    title: "Unauthorized",
    detail: "No active session. Please sign in again.",
  };
  return Response.json(body, { status: 401 });
}

export function createCoreUnavailableResponse(
  network: NetworkType = "testnet",
): Response {
  const body: ProblemDetails = {
    status: 503,
    code: "PLATFORM_CREDENTIAL_MISSING",
    title: "Service Unavailable",
    detail:
      network === "mainnet"
        ? "Mainnet core API is not configured on the server (CORE_API_URL_MAINNET)."
        : "Core API URL is not configured on the server.",
  };
  return Response.json(body, { status: 503 });
}

export async function coreFetch(
  path: string,
  init?: CoreFetchInit,
  bearer?: string,
): Promise<Response> {
  const { network = "testnet", ...fetchInit } = init ?? {};
  const token = bearer ?? (await getSessionToken(network));
  if (!token) {
    return createUnauthorizedResponse();
  }

  const baseUrl = serverEnv.api.coreApiUrlFor(network);
  if (!baseUrl) {
    return createCoreUnavailableResponse(network);
  }

  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(fetchInit.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("x-network", network);

  return fetch(url, {
    ...fetchInit,
    headers,
  });
}

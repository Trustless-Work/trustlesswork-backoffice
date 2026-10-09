import { serverEnv } from "@/lib/env";
import type { ProblemDetails } from "@/lib/api-error";
import type { NetworkType } from "@/types/network.entity";

export type PayrollFetchInit = RequestInit & {
  readonly network?: NetworkType;
};

export function createPayrollCredentialMissingResponse(
  network: NetworkType = "testnet",
): Response {
  const body: ProblemDetails = {
    status: 503,
    code: "PLATFORM_CREDENTIAL_MISSING",
    title: "Service Unavailable",
    detail:
      network === "mainnet"
        ? "Mainnet payroll API key is not configured on the server (PAYROLL_API_KEY_MAINNET). Create an ESCROW_MANAGER key for the mainnet payroll platform and set it in the server env."
        : "Payroll API key is not configured on the server (PAYROLL_API_KEY). Create an ESCROW_MANAGER key for the payroll platform and set it in the server env.",
  };
  return Response.json(body, { status: 503 });
}

export async function payrollFetch(
  path: string,
  init?: PayrollFetchInit,
): Promise<Response> {
  const { network = "testnet", ...fetchInit } = init ?? {};
  const apiKey = serverEnv.api.payrollApiKeyFor(network);
  const baseUrl = serverEnv.api.coreApiUrlFor(network);
  if (!apiKey || !baseUrl) {
    return createPayrollCredentialMissingResponse(network);
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

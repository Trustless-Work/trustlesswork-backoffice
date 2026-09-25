import { serverEnv } from "@/lib/env";
import type { ProblemDetails } from "@/lib/api-error";

export function createPayrollCredentialMissingResponse(): Response {
  const body: ProblemDetails = {
    status: 503,
    code: "PLATFORM_CREDENTIAL_MISSING",
    title: "Service Unavailable",
    detail:
      "Payroll API key is not configured on the server (PAYROLL_API_KEY). Create an ESCROW_MANAGER key for the payroll platform and set it in the server env.",
  };
  return Response.json(body, { status: 503 });
}

export async function payrollFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const apiKey = serverEnv.api.payrollApiKey;
  if (!apiKey) {
    return createPayrollCredentialMissingResponse();
  }

  const url = `${serverEnv.api.coreApiUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("x-api-key", apiKey);

  return fetch(url, {
    ...init,
    headers,
  });
}

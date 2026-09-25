import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("payrollFetch", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 503 when PAYROLL_API_KEY is unset", async () => {
    vi.doMock("@/lib/env", () => ({
      serverEnv: {
        api: {
          coreApiUrl: "https://api.example.com",
          payrollApiKey: undefined,
        },
      },
    }));

    const { payrollFetch, createPayrollCredentialMissingResponse } =
      await import("@/lib/payroll-fetch");

    const missing = createPayrollCredentialMissingResponse();
    expect(missing.status).toBe(503);

    const response = await payrollFetch("/helper/send-transaction");
    expect(response.status).toBe(503);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe("PLATFORM_CREDENTIAL_MISSING");
  });

  it("forwards x-api-key when PAYROLL_API_KEY is set", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    vi.doMock("@/lib/env", () => ({
      serverEnv: {
        api: {
          coreApiUrl: "https://api.example.com",
          payrollApiKey: "key.id.secret",
        },
      },
    }));

    const { payrollFetch } = await import("@/lib/payroll-fetch");
    await payrollFetch("/deployer/multi-release", {
      method: "POST",
      body: "{}",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.example.com/deployer/multi-release");
    const headers = new Headers(init.headers);
    expect(headers.get("x-api-key")).toBe("key.id.secret");
  });
});

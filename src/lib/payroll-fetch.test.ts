import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { NetworkType } from "@/types/network.entity";

function createApiMock(mainnetPayrollKey: string | undefined = "mainnet-payroll") {
  return {
    coreApiUrlFor: (network: NetworkType) =>
      network === "mainnet"
        ? "https://mainnet.example.com"
        : "https://testnet.example.com",
    payrollApiKeyFor: (network: NetworkType) => {
      if (network === "mainnet") {
        return mainnetPayrollKey;
      }
      return "testnet-payroll";
    },
  };
}

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
          coreApiUrlFor: () => "https://testnet.example.com",
          payrollApiKeyFor: () => undefined,
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

  it("forwards the testnet payroll key by default", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    vi.doMock("@/lib/env", () => ({
      serverEnv: { api: createApiMock() },
    }));

    const { payrollFetch } = await import("@/lib/payroll-fetch");
    await payrollFetch("/deployer/multi-release", {
      method: "POST",
      body: "{}",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://testnet.example.com/deployer/multi-release");
    const headers = new Headers(init.headers);
    expect(headers.get("x-api-key")).toBe("testnet-payroll");
    expect(headers.get("x-network")).toBe("testnet");
  });

  it("calls the mainnet core with the mainnet payroll key", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    vi.doMock("@/lib/env", () => ({
      serverEnv: { api: createApiMock() },
    }));

    const { payrollFetch } = await import("@/lib/payroll-fetch");
    await payrollFetch("/deployer/multi-release", {
      method: "POST",
      network: "mainnet",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://mainnet.example.com/deployer/multi-release");
    const headers = new Headers(init.headers);
    expect(headers.get("x-api-key")).toBe("mainnet-payroll");
    expect(headers.get("x-network")).toBe("mainnet");
  });

  it("returns 503 when the mainnet payroll key is missing", async () => {
    vi.doMock("@/lib/env", () => ({
      serverEnv: {
        api: {
          coreApiUrlFor: () => "https://mainnet.example.com",
          payrollApiKeyFor: () => undefined,
        },
      },
    }));

    const { payrollFetch } = await import("@/lib/payroll-fetch");
    const response = await payrollFetch("/deployer/multi-release", {
      network: "mainnet",
    });

    expect(response.status).toBe(503);
    const body = (await response.json()) as { detail: string };
    expect(body.detail).toContain("PAYROLL_API_KEY_MAINNET");
  });
});

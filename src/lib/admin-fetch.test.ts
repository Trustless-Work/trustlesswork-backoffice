import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { NetworkType } from "@/types/network.entity";

function createApiMock() {
  return {
    coreApiUrlFor: (network: NetworkType) =>
      network === "mainnet"
        ? "https://mainnet.example.com"
        : "https://testnet.example.com",
    adminApiKeyFor: (network: NetworkType) =>
      network === "mainnet" ? "mainnet-admin-key" : "testnet-admin-key",
  };
}

describe("adminFetch", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("calls the mainnet core with the mainnet admin key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    vi.doMock("@/lib/env", () => ({
      serverEnv: { api: createApiMock() },
    }));

    const { adminFetch } = await import("@/lib/admin-fetch");
    await adminFetch("/admin/users", { network: "mainnet" });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://mainnet.example.com/admin/users");
    const headers = new Headers(init.headers);
    expect(headers.get("x-api-key")).toBe("mainnet-admin-key");
    expect(headers.get("x-network")).toBe("mainnet");
  });

  it("keeps testnet on the default core and admin key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    vi.doMock("@/lib/env", () => ({
      serverEnv: { api: createApiMock() },
    }));

    const { adminFetch } = await import("@/lib/admin-fetch");
    await adminFetch("/auth/session/challenge", { method: "POST" });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://testnet.example.com/auth/session/challenge");
    const headers = new Headers(init.headers);
    expect(headers.get("x-api-key")).toBe("testnet-admin-key");
    expect(headers.get("x-network")).toBe("testnet");
  });

  it("returns 503 when the mainnet admin key is missing", async () => {
    vi.doMock("@/lib/env", () => ({
      serverEnv: {
        api: {
          coreApiUrlFor: () => "https://mainnet.example.com",
          adminApiKeyFor: () => undefined,
        },
      },
    }));

    const { adminFetch } = await import("@/lib/admin-fetch");
    const response = await adminFetch("/admin/users", { network: "mainnet" });
    expect(response.status).toBe(503);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe("PLATFORM_CREDENTIAL_MISSING");
  });
});

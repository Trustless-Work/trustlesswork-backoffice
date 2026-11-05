import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NetworkType } from "@/types/network.entity";

const coreFetch = vi.fn();

function mockCores(urls: Partial<Record<NetworkType, string>>) {
  vi.doMock("@/lib/env", () => ({
    serverEnv: {
      api: { coreApiUrlFor: (network: NetworkType) => urls[network] },
    },
  }));
  vi.doMock("@/lib/core-fetch", () => ({ coreFetch }));
}

const BOTH_CORES = {
  testnet: "https://testnet.example.com",
  mainnet: "https://mainnet.example.com",
};

async function provision() {
  const { provisionPlatforms } = await import("@/lib/provision-platforms");
  const pending = provisionPlatforms("Acme", "user-token");
  await vi.runAllTimersAsync();
  return pending;
}

describe("provisionPlatforms", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    coreFetch.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("creates the platform on every core with the user's token", async () => {
    mockCores(BOTH_CORES);
    coreFetch.mockResolvedValue(new Response("{}", { status: 201 }));

    await expect(provision()).resolves.toEqual({
      testnet: true,
      mainnet: true,
    });

    expect(coreFetch).toHaveBeenCalledTimes(2);
    const [path, init, bearer] = coreFetch.mock.calls[0];
    expect(path).toBe("/platforms");
    expect(init.body).toBe(JSON.stringify({ name: "Acme" }));
    expect(bearer).toBe("user-token");
  });

  it("skips a core that is not configured", async () => {
    mockCores({ testnet: BOTH_CORES.testnet });
    coreFetch.mockResolvedValue(new Response("{}", { status: 201 }));

    await expect(provision()).resolves.toEqual({ testnet: true });
    expect(coreFetch).toHaveBeenCalledTimes(1);
  });

  it("retries on 401 while the user mirror catches up", async () => {
    mockCores({ testnet: BOTH_CORES.testnet });
    coreFetch
      .mockResolvedValueOnce(new Response("{}", { status: 401 }))
      .mockResolvedValueOnce(new Response("{}", { status: 401 }))
      .mockResolvedValueOnce(new Response("{}", { status: 201 }));

    await expect(provision()).resolves.toEqual({ testnet: true });
    expect(coreFetch).toHaveBeenCalledTimes(3);
  });

  it("gives up after two retries", async () => {
    mockCores({ testnet: BOTH_CORES.testnet });
    coreFetch.mockImplementation(
      async () => new Response("{}", { status: 401 }),
    );

    await expect(provision()).resolves.toEqual({ testnet: false });
    expect(coreFetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry other failures, and one core failing spares the other", async () => {
    mockCores(BOTH_CORES);
    coreFetch.mockImplementation(async (_path, init) =>
      init.network === "mainnet"
        ? new Response("{}", { status: 500 })
        : new Response("{}", { status: 201 }),
    );

    await expect(provision()).resolves.toEqual({
      testnet: true,
      mainnet: false,
    });
    expect(coreFetch).toHaveBeenCalledTimes(2);
  });

  it("reports a network error as a failure instead of throwing", async () => {
    mockCores({ testnet: BOTH_CORES.testnet });
    coreFetch.mockRejectedValue(new Error("network down"));

    await expect(provision()).resolves.toEqual({ testnet: false });
  });
});

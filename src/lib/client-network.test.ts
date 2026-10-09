import { describe, expect, it } from "vitest";
import { resolveClientNetworkHeader } from "@/lib/client-network";

describe("resolveClientNetworkHeader", () => {
  it("uses an explicit mainnet header over the stored testnet", () => {
    expect(resolveClientNetworkHeader("mainnet", "testnet")).toBe("mainnet");
  });

  it("uses an explicit testnet header over the stored mainnet", () => {
    expect(resolveClientNetworkHeader("testnet", "mainnet")).toBe("testnet");
  });

  it("normalizes casing and whitespace", () => {
    expect(resolveClientNetworkHeader("  MAINNET  ", "testnet")).toBe("mainnet");
  });

  it("falls back to the stored network when the header is missing or invalid", () => {
    expect(resolveClientNetworkHeader(undefined, "mainnet")).toBe("mainnet");
    expect(resolveClientNetworkHeader(null, "testnet")).toBe("testnet");
    expect(resolveClientNetworkHeader("", "mainnet")).toBe("mainnet");
    expect(resolveClientNetworkHeader("futurenet", "testnet")).toBe("testnet");
    expect(resolveClientNetworkHeader(1, "mainnet")).toBe("mainnet");
  });
});

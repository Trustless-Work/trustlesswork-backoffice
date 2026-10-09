import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assignNetworkSession,
  hasUsableSession,
  isSessionExpired,
  readNetworkSession,
  type SessionData,
} from "@/lib/session";

describe("isSessionExpired", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false when expiresAt is missing or invalid", () => {
    expect(isSessionExpired(undefined)).toBe(false);
    expect(isSessionExpired("not-a-date")).toBe(false);
  });

  it("returns true when expiresAt is in the past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    expect(isSessionExpired("2025-12-31T23:59:59.000Z")).toBe(true);
  });

  it("returns false when expiresAt is in the future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    expect(isSessionExpired("2026-01-01T00:00:01.000Z")).toBe(false);
  });
});

describe("network sessions", () => {
  it("treats a legacy token as testnet only", () => {
    const session: SessionData = {
      token: "testnet-jwt",
      expiresAt: "2026-12-01T00:00:00.000Z",
    };

    expect(readNetworkSession(session, "testnet")?.token).toBe("testnet-jwt");
    expect(readNetworkSession(session, "mainnet")).toBeUndefined();
  });

  it("keeps the testnet token when a mainnet login is stored", () => {
    const session: SessionData = {
      token: "testnet-jwt",
      expiresAt: "2026-12-01T00:00:00.000Z",
    };

    assignNetworkSession(
      session,
      "mainnet",
      "mainnet-jwt",
      "2026-12-02T00:00:00.000Z",
    );

    expect(readNetworkSession(session, "testnet")?.token).toBe("testnet-jwt");
    expect(readNetworkSession(session, "mainnet")?.token).toBe("mainnet-jwt");
    expect(hasUsableSession(session)).toBe(true);
  });
});

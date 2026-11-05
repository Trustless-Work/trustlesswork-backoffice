import { afterEach, describe, expect, it, vi } from "vitest";
import { hasUsableSession, isSessionExpired } from "@/lib/session";

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

describe("hasUsableSession", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("requires a token", () => {
    expect(hasUsableSession({})).toBe(false);
  });

  it("accepts a token that has not expired", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    expect(
      hasUsableSession({
        token: "session-jwt",
        expiresAt: "2026-01-01T02:00:00.000Z",
      }),
    ).toBe(true);
  });

  it("rejects an expired token", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T03:00:00.000Z"));

    expect(
      hasUsableSession({
        token: "session-jwt",
        expiresAt: "2026-01-01T02:00:00.000Z",
      }),
    ).toBe(false);
  });
});

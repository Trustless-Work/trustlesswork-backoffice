import { describe, expect, it } from "vitest";
import { sanitizeLoginRedirect } from "@/features/auth/lib/login-redirect";

describe("sanitizeLoginRedirect", () => {
  it("keeps root-relative paths", () => {
    expect(sanitizeLoginRedirect("/dashboard/escrows?tab=open")).toBe(
      "/dashboard/escrows?tab=open",
    );
  });

  it.each([
    [null],
    [""],
    ["https://evil.example"],
    ["//evil.example"],
    ["/\\evil.example"],
    ["javascript:alert(1)"],
    ["/redirect?to=https://evil.example"],
  ])("falls back to the dashboard for %s", (raw) => {
    expect(sanitizeLoginRedirect(raw)).toBe("/dashboard");
  });
});

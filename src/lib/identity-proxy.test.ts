import { describe, expect, it } from "vitest";
import { isAllowedIdentityRoute } from "@/lib/identity-proxy";

describe("isAllowedIdentityRoute", () => {
  it.each([
    ["GET", "/users/me"],
    ["GET", "/users/me/wallets"],
    ["DELETE", "/users/me/wallets/GABC"],
    ["POST", "/wallets/link/challenge"],
    ["POST", "/wallets/link/verify"],
  ])("allows %s %s", (method, path) => {
    expect(isAllowedIdentityRoute(method, path)).toBe(true);
  });

  it.each([
    ["GET", "/admin/users"],
    ["PATCH", "/admin/users/some-id"],
    ["POST", "/auth/session/challenge"],
    ["POST", "/auth/register/verify"],
    ["POST", "/auth/bootstrap-admin"],
    ["DELETE", "/users/me"],
    ["GET", "/users/me/wallets/GABC/extra"],
  ])("blocks %s %s", (method, path) => {
    expect(isAllowedIdentityRoute(method, path)).toBe(false);
  });
});

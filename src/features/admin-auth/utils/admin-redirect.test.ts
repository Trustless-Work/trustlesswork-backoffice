import { describe, expect, it } from "vitest";
import { sanitizeAdminRedirect } from "@/features/admin-auth/utils/admin-redirect";

describe("sanitizeAdminRedirect", () => {
  it("keeps paths inside /admin", () => {
    expect(sanitizeAdminRedirect("/admin")).toBe("/admin");
    expect(sanitizeAdminRedirect("/admin/users")).toBe("/admin/users");
    expect(sanitizeAdminRedirect("/admin/users?page=2")).toBe(
      "/admin/users?page=2",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeAdminRedirect("  /admin/users  ")).toBe("/admin/users");
  });

  it("collapses absolute and protocol-relative URLs", () => {
    expect(sanitizeAdminRedirect("https://evil.com")).toBe("/admin");
    expect(sanitizeAdminRedirect("//evil.com")).toBe("/admin");
    expect(sanitizeAdminRedirect("http://evil.com/admin")).toBe("/admin");
    expect(sanitizeAdminRedirect("/\\evil.com")).toBe("/admin");
    expect(sanitizeAdminRedirect("\\\\evil.com")).toBe("/admin");
  });

  it("collapses paths outside /admin", () => {
    expect(sanitizeAdminRedirect("/dashboard")).toBe("/admin");
    expect(sanitizeAdminRedirect("/login")).toBe("/admin");
    expect(sanitizeAdminRedirect("/administrator")).toBe("/admin");
    expect(sanitizeAdminRedirect("/api/admin-auth/sign-out")).toBe("/admin");
  });

  it("never redirects back to the login page", () => {
    expect(sanitizeAdminRedirect("/admin/login")).toBe("/admin");
    expect(sanitizeAdminRedirect("/admin/login?reason=mfa_required")).toBe(
      "/admin",
    );
  });

  it("falls back to the admin home for missing input", () => {
    expect(sanitizeAdminRedirect(null)).toBe("/admin");
    expect(sanitizeAdminRedirect(undefined)).toBe("/admin");
    expect(sanitizeAdminRedirect("")).toBe("/admin");
  });
});

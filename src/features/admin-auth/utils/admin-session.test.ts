import { describe, expect, it } from "vitest";
import { evaluateAdminClaims } from "@/features/admin-auth/utils/admin-session";

const ALLOWED = "trustlesswork.com";

describe("evaluateAdminClaims", () => {
  it("returns ok for an aal2 session on the allowed domain", () => {
    expect(
      evaluateAdminClaims(
        { userId: "user-1", email: "Ada@TrustlessWork.com", aal: "aal2" },
        ALLOWED,
      ),
    ).toEqual({
      status: "ok",
      userId: "user-1",
      email: "ada@trustlesswork.com",
    });
  });

  it("returns unauthenticated without a user id", () => {
    expect(
      evaluateAdminClaims(
        { userId: null, email: "ada@trustlesswork.com", aal: "aal2" },
        ALLOWED,
      ),
    ).toEqual({ status: "unauthenticated" });

    expect(
      evaluateAdminClaims(
        { userId: "   ", email: "ada@trustlesswork.com", aal: "aal2" },
        ALLOWED,
      ),
    ).toEqual({ status: "unauthenticated" });
  });

  it("requires mfa for any level other than aal2", () => {
    for (const aal of ["aal1", null, "aal3", ""]) {
      expect(
        evaluateAdminClaims(
          { userId: "user-1", email: "ada@trustlesswork.com", aal },
          ALLOWED,
        ),
      ).toEqual({ status: "mfa_required", userId: "user-1" });
    }
  });

  it("checks mfa before the domain allowlist", () => {
    expect(
      evaluateAdminClaims(
        { userId: "user-1", email: "outsider@example.com", aal: "aal1" },
        ALLOWED,
      ),
    ).toEqual({ status: "mfa_required", userId: "user-1" });
  });

  it("rejects an aal2 session on a foreign domain", () => {
    expect(
      evaluateAdminClaims(
        { userId: "user-1", email: "outsider@example.com", aal: "aal2" },
        ALLOWED,
      ),
    ).toEqual({
      status: "forbidden_domain",
      userId: "user-1",
      email: "outsider@example.com",
    });
  });

  it("rejects an aal2 session on a subdomain of the allowed domain", () => {
    expect(
      evaluateAdminClaims(
        { userId: "user-1", email: "ada@evil.trustlesswork.com", aal: "aal2" },
        ALLOWED,
      ).status,
    ).toBe("forbidden_domain");
  });

  it("rejects an aal2 session with no email", () => {
    expect(
      evaluateAdminClaims(
        { userId: "user-1", email: null, aal: "aal2" },
        ALLOWED,
      ),
    ).toEqual({ status: "forbidden_domain", userId: "user-1", email: "" });
  });

  it("fails closed when the allowed domain is not configured", () => {
    expect(
      evaluateAdminClaims(
        { userId: "user-1", email: "ada@trustlesswork.com", aal: "aal2" },
        "",
      ).status,
    ).toBe("forbidden_domain");
  });
});

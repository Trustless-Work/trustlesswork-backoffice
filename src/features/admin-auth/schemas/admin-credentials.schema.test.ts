import { describe, expect, it } from "vitest";
import { createAdminCredentialsSchema } from "@/features/admin-auth/schemas/admin-credentials.schema";

const schema = createAdminCredentialsSchema("trustlesswork.com");

describe("createAdminCredentialsSchema", () => {
  it("accepts a valid pair", () => {
    const result = schema.safeParse({
      email: "ada@trustlesswork.com",
      password: "hunter2",
    });

    expect(result.success).toBe(true);
  });

  it("trims and lowercases the email", () => {
    const result = schema.safeParse({
      email: "  ADA@TrustlessWork.com  ",
      password: "hunter2",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ada@trustlesswork.com");
    }
  });

  it("rejects a foreign domain with actionable copy", () => {
    const result = schema.safeParse({
      email: "outsider@example.com",
      password: "hunter2",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Only Trustless Work staff can access the backoffice. Use your @trustlesswork.com account.",
      );
    }
  });

  it("rejects a subdomain of the allowed domain", () => {
    expect(
      schema.safeParse({
        email: "ada@evil.trustlesswork.com",
        password: "hunter2",
      }).success,
    ).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(
      schema.safeParse({ email: "notanemail", password: "hunter2" }).success,
    ).toBe(false);
  });

  it("rejects an empty email", () => {
    const result = schema.safeParse({ email: "   ", password: "hunter2" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Email is required");
    }
  });

  it("rejects an empty password", () => {
    const result = schema.safeParse({
      email: "ada@trustlesswork.com",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Password is required");
    }
  });

  it("uses the domain it was built with", () => {
    const other = createAdminCredentialsSchema("example.com");

    expect(
      other.safeParse({ email: "ada@example.com", password: "hunter2" }).success,
    ).toBe(true);
    expect(
      other.safeParse({ email: "ada@trustlesswork.com", password: "hunter2" })
        .success,
    ).toBe(false);
  });
});

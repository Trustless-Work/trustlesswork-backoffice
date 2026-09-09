import { describe, expect, it } from "vitest";
import { adminMfaSchema } from "@/features/admin-auth/schemas/admin-mfa.schema";

describe("adminMfaSchema", () => {
  it("accepts a six digit code", () => {
    const result = adminMfaSchema.safeParse({ code: "123456" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("123456");
    }
  });

  it("normalizes the spacing authenticator apps display", () => {
    const result = adminMfaSchema.safeParse({ code: " 123 456 " });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("123456");
    }
  });

  it("rejects a code of the wrong length", () => {
    const short = adminMfaSchema.safeParse({ code: "12345" });

    expect(short.success).toBe(false);
    if (!short.success) {
      expect(short.error.issues[0]?.message).toBe("Enter the 6-digit code");
    }

    expect(adminMfaSchema.safeParse({ code: "1234567" }).success).toBe(false);
  });

  it("rejects non-digit characters", () => {
    const result = adminMfaSchema.safeParse({ code: "12345a" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "The code must be digits only",
      );
    }
  });

  it("rejects an empty or whitespace-only code", () => {
    expect(adminMfaSchema.safeParse({ code: "" }).success).toBe(false);
    expect(adminMfaSchema.safeParse({ code: "      " }).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { registerSchema } from "@/features/auth/schemas/register.schema";

const validPayload = {
  firstName: "Ada",
  lastName: "Lovelace",
  organizationName: "Analytical Engine",
  email: "ada@example.com",
};

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validPayload);

    expect(result.success).toBe(true);
  });

  it("trims whitespace from names, organization, and email", () => {
    const result = registerSchema.safeParse({
      firstName: "  Ada  ",
      lastName: "  Lovelace  ",
      organizationName: "  Analytical Engine  ",
      email: "  ada@example.com  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe("Ada");
      expect(result.data.lastName).toBe("Lovelace");
      expect(result.data.organizationName).toBe("Analytical Engine");
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("rejects missing first name and invalid email", () => {
    const missingFirstName = registerSchema.safeParse({
      ...validPayload,
      firstName: "",
    });
    const invalidEmail = registerSchema.safeParse({
      ...validPayload,
      email: "not-an-email",
    });

    expect(missingFirstName.success).toBe(false);
    expect(invalidEmail.success).toBe(false);
  });

  it("rejects empty, too short, and too long organization names", () => {
    const empty = registerSchema.safeParse({
      ...validPayload,
      organizationName: "",
    });
    const tooShort = registerSchema.safeParse({
      ...validPayload,
      organizationName: "A",
    });
    const tooLong = registerSchema.safeParse({
      ...validPayload,
      organizationName: "a".repeat(81),
    });

    expect(empty.success).toBe(false);
    expect(tooShort.success).toBe(false);
    expect(tooLong.success).toBe(false);
  });
});

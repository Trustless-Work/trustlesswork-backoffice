import { describe, expect, it } from "vitest";
import {
  extractEmailDomain,
  matchesAllowedEmailDomain,
} from "@/features/admin-auth/utils/email-domain";

const ALLOWED = "trustlesswork.com";

describe("extractEmailDomain", () => {
  it("returns the lowercased domain", () => {
    expect(extractEmailDomain("Ada@TrustlessWork.COM")).toBe(
      "trustlesswork.com",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(extractEmailDomain("  ada@trustlesswork.com  ")).toBe(
      "trustlesswork.com",
    );
  });

  it("normalizes a single trailing dot", () => {
    expect(extractEmailDomain("ada@trustlesswork.com.")).toBe(
      "trustlesswork.com",
    );
  });

  it("resolves multiple @ using the last one", () => {
    expect(extractEmailDomain("a@b@trustlesswork.com")).toBe(
      "trustlesswork.com",
    );
  });

  it("returns null for malformed input", () => {
    expect(extractEmailDomain("notanemail")).toBeNull();
    expect(extractEmailDomain("@trustlesswork.com")).toBeNull();
    expect(extractEmailDomain("ada@")).toBeNull();
    expect(extractEmailDomain("ada@.")).toBeNull();
    expect(extractEmailDomain("")).toBeNull();
    expect(extractEmailDomain(null)).toBeNull();
    expect(extractEmailDomain(undefined)).toBeNull();
  });
});

describe("matchesAllowedEmailDomain", () => {
  it("accepts an exact domain match", () => {
    expect(matchesAllowedEmailDomain("ada@trustlesswork.com", ALLOWED)).toBe(
      true,
    );
  });

  it("is case-insensitive on both sides", () => {
    expect(
      matchesAllowedEmailDomain("Ada@TrustlessWork.COM", "TrustlessWork.com"),
    ).toBe(true);
  });

  it("accepts plus-addressing in the local part", () => {
    expect(
      matchesAllowedEmailDomain("ada+admin@trustlesswork.com", ALLOWED),
    ).toBe(true);
  });

  it("tolerates a padded allowed domain from env", () => {
    expect(
      matchesAllowedEmailDomain("ada@trustlesswork.com", "  TrustlessWork.com  "),
    ).toBe(true);
  });

  it("rejects subdomains", () => {
    expect(
      matchesAllowedEmailDomain("ada@sub.trustlesswork.com", ALLOWED),
    ).toBe(false);
    expect(
      matchesAllowedEmailDomain("ada@evil.trustlesswork.com", ALLOWED),
    ).toBe(false);
  });

  it("rejects a domain that merely ends with the allowed one", () => {
    expect(
      matchesAllowedEmailDomain("ada@nottrustlesswork.com", ALLOWED),
    ).toBe(false);
  });

  it("rejects the allowed domain used as a prefix of another", () => {
    expect(
      matchesAllowedEmailDomain("ada@trustlesswork.com.evil.com", ALLOWED),
    ).toBe(false);
  });

  it("rejects malformed emails", () => {
    expect(matchesAllowedEmailDomain("notanemail", ALLOWED)).toBe(false);
    expect(matchesAllowedEmailDomain("@trustlesswork.com", ALLOWED)).toBe(false);
    expect(matchesAllowedEmailDomain("ada@", ALLOWED)).toBe(false);
    expect(matchesAllowedEmailDomain("", ALLOWED)).toBe(false);
    expect(matchesAllowedEmailDomain(null, ALLOWED)).toBe(false);
    expect(matchesAllowedEmailDomain(undefined, ALLOWED)).toBe(false);
  });

  it("fails closed when the allowed domain is missing", () => {
    expect(matchesAllowedEmailDomain("ada@trustlesswork.com", "")).toBe(false);
    expect(matchesAllowedEmailDomain("ada@trustlesswork.com", "   ")).toBe(
      false,
    );
    expect(matchesAllowedEmailDomain("ada@trustlesswork.com", null)).toBe(false);
    expect(matchesAllowedEmailDomain("ada@trustlesswork.com", undefined)).toBe(
      false,
    );
  });
});

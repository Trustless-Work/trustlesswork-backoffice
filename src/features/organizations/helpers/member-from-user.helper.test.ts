import { describe, expect, it } from "vitest";
import {
  buildSubjectWalletPatch,
  mapUserToMemberInput,
  normalizeSubjectWalletAddress,
} from "@/features/organizations/helpers/member-from-user.helper";
import type { MemberResponse } from "@/features/organizations/types/organization.types";
import type { UserResponse } from "@/types";

const VALID_WALLET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

const user: UserResponse = {
  id: "user-1",
  firstName: "Ada",
  email: "ada@trustlesswork.com",
  isActive: true,
  roles: ["ESCROW_MANAGER"],
};

function member(walletAddress?: string | null): MemberResponse {
  return {
    id: "subject-1",
    platformId: "platform-1",
    externalId: user.id,
    walletAddress,
  };
}

describe("normalizeSubjectWalletAddress", () => {
  it("trims a valid Stellar public key", () => {
    expect(normalizeSubjectWalletAddress(`  ${VALID_WALLET}  `)).toBe(
      VALID_WALLET,
    );
  });

  it("drops empty, null, and invalid values", () => {
    expect(normalizeSubjectWalletAddress(undefined)).toBeUndefined();
    expect(normalizeSubjectWalletAddress(null)).toBeUndefined();
    expect(normalizeSubjectWalletAddress("")).toBeUndefined();
    expect(normalizeSubjectWalletAddress("   ")).toBeUndefined();
    expect(normalizeSubjectWalletAddress("not-a-key")).toBeUndefined();
    expect(normalizeSubjectWalletAddress(`G${"A".repeat(54)}`)).toBeUndefined();
  });
});

describe("mapUserToMemberInput", () => {
  it("includes walletAddress when the wallet is a Stellar public key", () => {
    expect(mapUserToMemberInput(user, ` ${VALID_WALLET} `)).toEqual({
      externalId: "user-1",
      label: "Ada",
      metadata: { email: "ada@trustlesswork.com" },
      walletAddress: VALID_WALLET,
    });
  });

  it("omits walletAddress when the wallet is unknown or invalid", () => {
    expect(mapUserToMemberInput(user, null)).not.toHaveProperty("walletAddress");
    expect(mapUserToMemberInput(user, "")).not.toHaveProperty("walletAddress");
    expect(mapUserToMemberInput(user, "not-a-key")).not.toHaveProperty(
      "walletAddress",
    );
  });
});

describe("buildSubjectWalletPatch", () => {
  it("patches a subject that has no wallet when one is known", () => {
    expect(buildSubjectWalletPatch(member(null), VALID_WALLET)).toEqual({
      walletAddress: VALID_WALLET,
    });
  });

  it("leaves an existing wallet untouched", () => {
    expect(buildSubjectWalletPatch(member(VALID_WALLET), VALID_WALLET)).toBeNull();
  });

  it("returns null when the known wallet is missing or invalid", () => {
    expect(buildSubjectWalletPatch(member(null), null)).toBeNull();
    expect(buildSubjectWalletPatch(member(null), "not-a-key")).toBeNull();
  });
});

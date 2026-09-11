import { describe, expect, it } from "vitest";
import type { StoredSingleReleaseEscrow } from "@/features/escrows/types/escrow.types";
import { getEscrowRoleEntries } from "@/features/escrows/utils/escrow-display.helper";

const OBSERVER = "GOBSERVER";

function createSingleEscrow(observers?: string[]): StoredSingleReleaseEscrow {
  return {
    type: "single-release",
    contractId: "CDCONTRACT",
    signer: "GADMIN",
    engagementId: "eng-1",
    title: "Test escrow",
    description: "Description",
    platformFee: 1,
    balance: 0,
    amount: 100,
    trustline: {
      address: "GUSDC",
      symbol: "USDC",
      contractId: "CUSDC",
    },
    roles: {
      admin: "GADMIN",
      approvers: ["GAPPROVER"],
      serviceProviders: ["GSERVICE"],
      releaseSigners: ["GRELEASE"],
      disputeResolvers: ["GDISPUTE"],
      platform: "GPLATFORM",
      receiver: "GRECEIVER",
      ...(observers ? { observers } : {}),
    },
    milestones: [
      { description: "Milestone 1", status: "pending", approvalsTarget: 1 },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("getEscrowRoleEntries", () => {
  it("always includes observers, even when none are assigned", () => {
    const entries = getEscrowRoleEntries(createSingleEscrow());
    const observers = entries.find((entry) => entry.id === "observers");

    expect(observers).toEqual({
      id: "observers",
      label: "Observers",
      addresses: [],
    });
    expect(entries[entries.length - 1]?.id).toBe("observers");
  });

  it("surfaces assigned observer wallets", () => {
    const entries = getEscrowRoleEntries(createSingleEscrow([OBSERVER]));
    const observers = entries.find((entry) => entry.id === "observers");

    expect(observers?.addresses).toEqual([OBSERVER]);
  });
});

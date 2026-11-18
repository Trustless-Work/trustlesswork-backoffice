import { describe, expect, it } from "vitest";
import { EscrowRoleContext } from "@/features/escrows/domain/escrow-role-context";
import { SingleReleaseActionPolicy } from "@/features/escrows/domain/single-release-action-policy";
import { MultiReleaseActionPolicy } from "@/features/escrows/domain/multi-release-action-policy";
import type {
  StoredMultiReleaseEscrow,
  StoredSingleReleaseEscrow,
} from "@/features/escrows/types/escrow.types";

const ADMIN = "GADMIN";
const RECEIVER = "GRECEIVER";
const MILESTONE_RECEIVER = "GMILESTONE";

function createSingleEscrow(
  overrides?: Partial<StoredSingleReleaseEscrow>,
): StoredSingleReleaseEscrow {
  return {
    type: "single-release",
    contractId: "CDCONTRACT",
    signer: ADMIN,
    engagementId: "eng-1",
    title: "Test escrow",
    description: "Description",
    platformFee: 1,
    balance: 100,
    amount: 100,
    trustline: { address: "GUSDC", symbol: "USDC", contractId: "CUSDC" },
    roles: {
      admin: ADMIN,
      approvers: [],
      serviceProviders: [],
      releaseSigners: [],
      disputeResolvers: [],
      platform: "GPLATFORM",
      receiver: RECEIVER,
      observers: [],
    },
    milestones: [
      {
        description: "Milestone 1",
        approvalsTarget: 1,
        approvals: { target: 1, approvalCount: 0, approvedBy: [] },
      },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createMultiEscrow(
  milestoneOverrides?: Partial<StoredMultiReleaseEscrow["milestones"][number]>,
): StoredMultiReleaseEscrow {
  return {
    type: "multi-release",
    contractId: "CDCONTRACT",
    signer: ADMIN,
    engagementId: "eng-1",
    title: "Test multi escrow",
    description: "Description",
    platformFee: 1,
    balance: 100,
    trustline: { address: "GUSDC", symbol: "USDC", contractId: "CUSDC" },
    roles: {
      admin: ADMIN,
      approvers: [],
      serviceProviders: [],
      releaseSigners: [],
      disputeResolvers: [],
      platform: "GPLATFORM",
      observers: [],
    },
    milestones: [
      {
        description: "Milestone 1",
        amount: 50,
        receiver: MILESTONE_RECEIVER,
        approvalsTarget: 1,
        approvals: { target: 1, approvalCount: 0, approvedBy: [] },
        ...milestoneOverrides,
      },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("EscrowActionPolicy.canManagePayoutPreference", () => {
  describe("single-release", () => {
    it("allows the receiver when the escrow is still open", () => {
      const escrow = createSingleEscrow();
      const policy = new SingleReleaseActionPolicy(
        escrow,
        new EscrowRoleContext(escrow, RECEIVER),
      );

      expect(policy.canManagePayoutPreference()).toBe(true);
    });

    it("hides it once the escrow is released", () => {
      const escrow = createSingleEscrow({ released: true });
      const policy = new SingleReleaseActionPolicy(
        escrow,
        new EscrowRoleContext(escrow, RECEIVER),
      );

      expect(policy.canManagePayoutPreference()).toBe(false);
    });

    it("hides it once the escrow's dispute is resolved", () => {
      const escrow = createSingleEscrow({
        dispute: { isDisputed: true, resolved: true, reason: "test dispute" },
      });
      const policy = new SingleReleaseActionPolicy(
        escrow,
        new EscrowRoleContext(escrow, RECEIVER),
      );

      expect(policy.canManagePayoutPreference()).toBe(false);
    });

    it("hides it for a non-receiver regardless of status", () => {
      const escrow = createSingleEscrow();
      const policy = new SingleReleaseActionPolicy(
        escrow,
        new EscrowRoleContext(escrow, ADMIN),
      );

      expect(policy.canManagePayoutPreference()).toBe(false);
    });
  });

  describe("multi-release", () => {
    it("allows the milestone receiver when the milestone is still open", () => {
      const escrow = createMultiEscrow();
      const policy = new MultiReleaseActionPolicy(
        escrow,
        new EscrowRoleContext(escrow, MILESTONE_RECEIVER),
      );

      expect(policy.canManagePayoutPreference(0)).toBe(true);
    });

    it("hides it once the milestone is released", () => {
      const escrow = createMultiEscrow({ released: true });
      const policy = new MultiReleaseActionPolicy(
        escrow,
        new EscrowRoleContext(escrow, MILESTONE_RECEIVER),
      );

      expect(policy.canManagePayoutPreference(0)).toBe(false);
    });

    it("hides it once the milestone's dispute is resolved", () => {
      const escrow = createMultiEscrow({
        dispute: { isDisputed: true, resolved: true, reason: "test dispute" },
      });
      const policy = new MultiReleaseActionPolicy(
        escrow,
        new EscrowRoleContext(escrow, MILESTONE_RECEIVER),
      );

      expect(policy.canManagePayoutPreference(0)).toBe(false);
    });

    it("hides it for a non-receiver regardless of status", () => {
      const escrow = createMultiEscrow();
      const policy = new MultiReleaseActionPolicy(
        escrow,
        new EscrowRoleContext(escrow, ADMIN),
      );

      expect(policy.canManagePayoutPreference(0)).toBe(false);
    });
  });
});

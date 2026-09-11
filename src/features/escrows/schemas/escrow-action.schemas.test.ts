import { describe, expect, it } from "vitest";
import {
  createManageMilestonesSchema,
  updateEscrowSchema,
} from "@/features/escrows/schemas/escrow-action.schemas";
import { getApprovalsTargetExceedsApproversMessage } from "@/features/escrows/utils/create-escrow.helper";

const VALID_ADDRESS = `G${"A".repeat(55)}`;
const PLATFORM_ADDRESS = `G${"B".repeat(55)}`;
const RESOLVER_ADDRESS = `G${"C".repeat(55)}`;
const ADMIN_ADDRESS = `G${"D".repeat(55)}`;
const TRUSTLINE_CONTRACT =
  "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

describe("createManageMilestonesSchema", () => {
  it("rejects new milestones when approvalsTarget exceeds approversCount", () => {
    const schema = createManageMilestonesSchema({
      isMulti: false,
      approversCount: 1,
      existingCount: 1,
    });

    const result = schema.safeParse({
      existingMilestones: [{ index: 0, description: "Keep", amount: 0 }],
      newMilestones: [
        {
          description: "Extra work",
          approvalsTarget: 2,
          amount: 0,
          receiver: "",
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["newMilestones", 0, "approvalsTarget"],
          message: getApprovalsTargetExceedsApproversMessage(2, 1),
        }),
      ]),
    );
  });

  it("accepts new milestones when approvalsTarget is within approversCount", () => {
    const schema = createManageMilestonesSchema({
      isMulti: true,
      approversCount: 2,
      existingCount: 1,
    });

    const result = schema.safeParse({
      existingMilestones: [{ index: 0, description: "Keep", amount: 100 }],
      newMilestones: [
        {
          description: "Extra work",
          approvalsTarget: 2,
          amount: 50,
          receiver: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("requires receiver and amount for multi-release new milestones", () => {
    const schema = createManageMilestonesSchema({
      isMulti: true,
      approversCount: 2,
      existingCount: 0,
    });

    const result = schema.safeParse({
      existingMilestones: [],
      newMilestones: [
        {
          description: "Extra work",
          approvalsTarget: 1,
          amount: 0,
          receiver: "",
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["newMilestones", 0, "amount"] }),
        expect.objectContaining({ path: ["newMilestones", 0, "receiver"] }),
      ]),
    );
  });

  it("rejects adding milestones beyond the 50 limit", () => {
    const schema = createManageMilestonesSchema({
      isMulti: false,
      approversCount: 1,
      existingCount: 50,
    });

    const result = schema.safeParse({
      existingMilestones: [],
      newMilestones: [
        {
          description: "One more",
          approvalsTarget: 1,
          amount: 0,
          receiver: "",
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["newMilestones"] }),
      ]),
    );
  });
});

describe("updateEscrowSchema", () => {
  const singleRoles = {
    approvers: [VALID_ADDRESS],
    serviceProviders: [VALID_ADDRESS],
    platform: PLATFORM_ADDRESS,
    releaseSigners: [VALID_ADDRESS],
    disputeResolvers: [RESOLVER_ADDRESS],
    admin: ADMIN_ADDRESS,
    receiver: VALID_ADDRESS,
    observers: [],
  };

  it("accepts a valid single-release update payload", () => {
    const result = updateEscrowSchema.safeParse({
      type: "single-release",
      engagementId: "eng-1",
      title: "Updated title",
      description: "Updated description",
      amount: 100,
      platformFee: 5,
      roles: singleRoles,
      trustline: {
        isCustom: true,
        address: TRUSTLINE_CONTRACT,
        symbol: "USDC",
      },
    });

    expect(result.success).toBe(true);
  });

  it("enforces the 100 character title limit", () => {
    const result = updateEscrowSchema.safeParse({
      type: "single-release",
      engagementId: "eng-1",
      title: "a".repeat(101),
      description: "Updated description",
      amount: 100,
      platformFee: 5,
      roles: singleRoles,
      trustline: {
        isCustom: true,
        address: TRUSTLINE_CONTRACT,
        symbol: "USDC",
      },
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["title"] })]),
    );
  });

  it("accepts a multi-release update without amount", () => {
    const result = updateEscrowSchema.safeParse({
      type: "multi-release",
      engagementId: "eng-1",
      title: "Updated title",
      description: "Updated description",
      platformFee: 5,
      roles: {
        approvers: [VALID_ADDRESS],
        serviceProviders: [VALID_ADDRESS],
        platform: PLATFORM_ADDRESS,
        releaseSigners: [VALID_ADDRESS],
        disputeResolvers: [RESOLVER_ADDRESS],
        admin: ADMIN_ADDRESS,
        observers: [`G${"E".repeat(55)}`],
      },
      trustline: {
        isCustom: true,
        address: TRUSTLINE_CONTRACT,
        symbol: "USDC",
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.roles.observers).toEqual([`G${"E".repeat(55)}`]);
  });
});

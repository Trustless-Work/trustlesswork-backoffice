import { describe, expect, it } from "vitest";
import { createEscrowSchema } from "@/features/escrows/schemas/create-escrow.schema";

const WALLET = `G${"A".repeat(55)}`;
const PLATFORM = `G${"B".repeat(55)}`;
const DISPUTE_RESOLVER = `G${"C".repeat(55)}`;
const ADMIN = `G${"D".repeat(55)}`;
const TRUSTLINE_CONTRACT =
  "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

const baseRoles = {
  approvers: [WALLET],
  serviceProviders: [WALLET],
  platform: PLATFORM,
  releaseSigners: [WALLET],
  disputeResolvers: [DISPUTE_RESOLVER],
  admin: ADMIN,
  observers: [],
};

const trustline = {
  isCustom: false,
  address: TRUSTLINE_CONTRACT,
  symbol: "USDC",
};

describe("createEscrowSchema", () => {
  it("allows a single-release escrow with amount 0", () => {
    const result = createEscrowSchema.safeParse({
      type: "single-release",
      engagementId: "eng-zero",
      title: "Zero amount escrow",
      description: "Deploy without funding amount",
      amount: 0,
      platformFee: 2,
      roles: {
        ...baseRoles,
        receiver: WALLET,
      },
      milestones: [{ description: "Kickoff", approvalsTarget: 1 }],
      trustline,
    });

    expect(result.success).toBe(true);
  });

  it("allows a multi-release escrow with milestone amount 0", () => {
    const result = createEscrowSchema.safeParse({
      type: "multi-release",
      engagementId: "eng-zero-multi",
      title: "Zero amount multi-release",
      description: "Deploy without milestone amounts",
      platformFee: 2,
      roles: baseRoles,
      milestones: [
        {
          description: "Kickoff",
          approvalsTarget: 1,
          amount: 0,
          receiver: WALLET,
        },
      ],
      trustline,
    });

    expect(result.success).toBe(true);
  });

  it("allows deploying without milestones", () => {
    const result = createEscrowSchema.safeParse({
      type: "single-release",
      engagementId: "eng-no-milestones",
      title: "Escrow without milestones",
      description: "Deploy with an empty milestones list",
      amount: 0,
      platformFee: 2,
      roles: {
        ...baseRoles,
        receiver: WALLET,
      },
      milestones: [],
      trustline,
    });

    expect(result.success).toBe(true);
  });

  it("rejects negative amounts", () => {
    const result = createEscrowSchema.safeParse({
      type: "single-release",
      engagementId: "eng-negative",
      title: "Negative amount",
      description: "Should fail",
      amount: -1,
      platformFee: 2,
      roles: {
        ...baseRoles,
        receiver: WALLET,
      },
      milestones: [{ description: "Kickoff", approvalsTarget: 1 }],
      trustline,
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["amount"] })]),
    );
  });

  it("allows deploying without observers", () => {
    const result = createEscrowSchema.safeParse({
      type: "single-release",
      engagementId: "eng-no-observers",
      title: "No observers",
      description: "Optional observers list omitted",
      amount: 0,
      platformFee: 2,
      roles: {
        ...baseRoles,
        receiver: WALLET,
        observers: undefined,
      },
      milestones: [{ description: "Kickoff", approvalsTarget: 1 }],
      trustline,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.roles.observers).toEqual([]);
  });

  it("strips blank observer fields and keeps valid addresses", () => {
    const observer = `G${"E".repeat(55)}`;
    const result = createEscrowSchema.safeParse({
      type: "single-release",
      engagementId: "eng-observers",
      title: "With observers",
      description: "Optional observers list",
      amount: 0,
      platformFee: 2,
      roles: {
        ...baseRoles,
        receiver: WALLET,
        observers: ["", `  ${observer}  `, ""],
      },
      milestones: [{ description: "Kickoff", approvalsTarget: 1 }],
      trustline,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.roles.observers).toEqual([observer]);
  });

  it("rejects more than 5 observers", () => {
    const result = createEscrowSchema.safeParse({
      type: "single-release",
      engagementId: "eng-too-many-observers",
      title: "Too many observers",
      description: "Over the role list cap",
      amount: 0,
      platformFee: 2,
      roles: {
        ...baseRoles,
        receiver: WALLET,
        observers: [
          `G${"E".repeat(55)}`,
          `G${"F".repeat(55)}`,
          `G${"G".repeat(55)}`,
          `G${"H".repeat(55)}`,
          `G${"I".repeat(55)}`,
          `G${"J".repeat(55)}`,
        ],
      },
      milestones: [{ description: "Kickoff", approvalsTarget: 1 }],
      trustline,
    });

    expect(result.success).toBe(false);
  });
});

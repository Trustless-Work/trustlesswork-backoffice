import { describe, expect, it } from "vitest";
import type {
  StoredMultiReleaseEscrow,
  StoredSingleReleaseEscrow,
} from "@/features/escrows/types/escrow.types";
import {
  buildUpdateEscrowDefaultValues,
  buildUpdateEscrowPayload,
} from "@/features/escrows/utils/update-escrow-payload.helper";

const ADMIN = "GADMIN";
const PLATFORM = "GPLATFORM";
const APPROVER = "GAPPROVER";
const RECEIVER = "GRECEIVER";

function createSingleEscrow(): StoredSingleReleaseEscrow {
  return {
    type: "single-release",
    contractId: "CDCONTRACT",
    signer: ADMIN,
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
      admin: ADMIN,
      approvers: [APPROVER],
      serviceProviders: ["GSERVICE"],
      releaseSigners: ["GRELEASE"],
      disputeResolvers: ["GDISPUTE"],
      platform: PLATFORM,
      receiver: RECEIVER,
      observers: ["GOBSERVER"],
    },
    milestones: [
      { description: "Milestone 1", status: "pending", approvalsTarget: 1 },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function createMultiEscrow(): StoredMultiReleaseEscrow {
  return {
    type: "multi-release",
    contractId: "CDCONTRACT",
    signer: ADMIN,
    engagementId: "eng-1",
    title: "Test multi escrow",
    description: "Description",
    platformFee: 1,
    balance: 0,
    trustline: {
      address: "GUSDC",
      symbol: "USDC",
      contractId: "CUSDC",
    },
    roles: {
      admin: ADMIN,
      approvers: [APPROVER],
      serviceProviders: ["GSERVICE"],
      releaseSigners: ["GRELEASE"],
      disputeResolvers: ["GDISPUTE"],
      platform: PLATFORM,
    },
    milestones: [
      {
        description: "Milestone 1",
        status: "pending",
        approvalsTarget: 1,
        amount: 50,
        receiver: RECEIVER,
      },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("buildUpdateEscrowDefaultValues", () => {
  it("maps single-release escrow into form defaults", () => {
    const defaults = buildUpdateEscrowDefaultValues(createSingleEscrow());

    expect(defaults.type).toBe("single-release");
    if (defaults.type !== "single-release") {
      return;
    }

    expect(defaults.amount).toBe(100);
    expect(defaults.roles.receiver).toBe(RECEIVER);
    expect(defaults.roles.observers).toEqual(["GOBSERVER"]);
    expect(defaults.trustline.address).toBe("CUSDC");
    expect(defaults.trustline.isCustom).toBe(true);
  });

  it("uses the asset Select preset when trustline matches a known option", () => {
    const escrow = createSingleEscrow();
    escrow.trustline.contractId =
      "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
    escrow.trustline.address =
      "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
    escrow.trustline.symbol = "USDC";

    const defaults = buildUpdateEscrowDefaultValues(escrow);

    expect(defaults.trustline.isCustom).toBe(false);
    expect(defaults.trustline.address).toBe(
      "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    );
    expect(defaults.trustline.symbol).toBe("USDC");
  });

  it("omits amount for multi-release escrows", () => {
    const defaults = buildUpdateEscrowDefaultValues(createMultiEscrow());

    expect(defaults.type).toBe("multi-release");
    expect("amount" in defaults).toBe(false);
  });
});

describe("buildUpdateEscrowPayload", () => {
  it("echoes milestones, admin and platform for single-release", () => {
    const escrow = createSingleEscrow();
    const payload = buildUpdateEscrowPayload(escrow, {
      type: "single-release",
      engagementId: "eng-updated",
      title: "New title",
      description: "New description",
      amount: 200,
      platformFee: 3,
      roles: {
        approvers: [APPROVER],
        serviceProviders: ["GSERVICE"],
        platform: "GTAMPERED",
        releaseSigners: ["GRELEASE"],
        disputeResolvers: ["GDISPUTE"],
        admin: "GTAMPERED",
        receiver: "GNEWRECEIVER",
        observers: ["GNEWOBSERVER"],
      },
      trustline: { isCustom: true, address: "CNEWSAC", symbol: "EURC" },
    });

    expect("amount" in payload.escrow).toBe(true);
    expect(payload.admin).toBe(ADMIN);
    expect(payload.escrow.roles.admin).toBe(ADMIN);
    expect(payload.escrow.roles.platform).toBe(PLATFORM);
    expect(payload.escrow.roles.observers).toEqual(["GNEWOBSERVER"]);
    expect(payload.escrow.title).toBe("New title");
    expect(payload.escrow.trustline.contractId).toBe("CNEWSAC");
    expect(payload.escrow.milestones).toHaveLength(1);
    expect(payload.escrow.milestones[0].description).toBe("Milestone 1");
  });

  it("builds a multi-release payload without amount", () => {
    const escrow = createMultiEscrow();
    const payload = buildUpdateEscrowPayload(escrow, {
      type: "multi-release",
      engagementId: "eng-updated",
      title: "New title",
      description: "New description",
      platformFee: 3,
      roles: {
        approvers: [APPROVER],
        serviceProviders: ["GSERVICE"],
        platform: "GTAMPERED",
        releaseSigners: ["GRELEASE"],
        disputeResolvers: ["GDISPUTE"],
        admin: "GTAMPERED",
        observers: [],
      },
      trustline: { isCustom: true, address: "CNEWSAC", symbol: "EURC" },
    });

    const props = payload.escrow;
    expect("amount" in props).toBe(false);
    expect(props.roles.admin).toBe(ADMIN);
    expect(props.roles.platform).toBe(PLATFORM);
    expect(props.roles.observers).toEqual([]);

    if ("amount" in props) {
      throw new Error("Expected a multi-release update payload");
    }

    expect(props.milestones[0].amount).toBe(50);
    expect(props.milestones[0].receiver).toBe(RECEIVER);
  });
});

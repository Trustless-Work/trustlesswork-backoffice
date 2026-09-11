import { describe, expect, it } from "vitest";
import type {
  MultiReleaseCreateFormData,
  SingleReleaseCreateFormData,
} from "@/features/escrows/schemas/create-escrow.schema";
import { toDeployPayload } from "@/features/escrows/utils/create-escrow-payload.helper";

const WALLET = `G${"A".repeat(55)}`;
const PLATFORM = `G${"B".repeat(55)}`;
const DISPUTE_RESOLVER = `G${"C".repeat(55)}`;
const ADMIN = `G${"D".repeat(55)}`;
const OBSERVER = `G${"E".repeat(55)}`;
const TRUSTLINE_CONTRACT =
  "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

const baseRoles = {
  approvers: [WALLET],
  serviceProviders: [WALLET],
  platform: PLATFORM,
  releaseSigners: [WALLET],
  disputeResolvers: [DISPUTE_RESOLVER],
  admin: ADMIN,
  observers: [OBSERVER],
};

const trustline = {
  isCustom: false,
  address: TRUSTLINE_CONTRACT,
  symbol: "USDC",
};

describe("toDeployPayload", () => {
  it("includes observers on a single-release deploy payload", () => {
    const values: SingleReleaseCreateFormData = {
      type: "single-release",
      engagementId: "eng-1",
      title: "Title",
      description: "Description",
      amount: 100,
      platformFee: 2,
      roles: {
        ...baseRoles,
        receiver: WALLET,
      },
      milestones: [{ description: "Kickoff", approvalsTarget: 1 }],
      trustline,
    };

    const payload = toDeployPayload(values, WALLET);

    expect(payload.roles.observers).toEqual([OBSERVER]);
    expect("receiver" in payload.roles).toBe(true);
  });

  it("includes observers on a multi-release deploy payload", () => {
    const values: MultiReleaseCreateFormData = {
      type: "multi-release",
      engagementId: "eng-2",
      title: "Title",
      description: "Description",
      platformFee: 2,
      roles: baseRoles,
      milestones: [
        {
          description: "Kickoff",
          approvalsTarget: 1,
          amount: 50,
          receiver: WALLET,
        },
      ],
      trustline,
    };

    const payload = toDeployPayload(values, WALLET);

    expect(payload.roles.observers).toEqual([OBSERVER]);
    expect("receiver" in payload.roles).toBe(false);
  });
});

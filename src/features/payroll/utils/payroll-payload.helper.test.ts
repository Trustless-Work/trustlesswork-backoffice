import { describe, expect, it } from "vitest";
import type { PayrollRunFormData } from "@/features/payroll/schemas/payroll-run.schema";
import {
  getPayrollRunTotal,
  toPayrollDeployPayload,
} from "@/features/payroll/utils/payroll-payload.helper";

const signer =
  "GCK27OWIRLRVHGFOOO67SF5NL2LD5WIQSFAT5MMFEF7AGUOREUL7SBSX";
const disputeResolver =
  "GCWTL5XN22BWFB6QSF4SKYKFQP3G3KTEHUFK7HR7CGRQJFVCO2WVXVLE";

const alberto =
  "GCK27OWIRLRVHGFOOO67SF5NL2LD5WIQSFAT5MMFEF7AGUOREUL7SBSX";
const joel =
  "GCWTL5XN22BWFB6QSF4SKYKFQP3G3KTEHUFK7HR7CGRQJFVCO2WVXVLE";

const formValues: PayrollRunFormData = {
  month: 10,
  year: 2026,
  quincena: 1,
  members: [
    {
      email: "alberto@trustlesswork.com",
      displayName: "Alberto",
      address: alberto,
      amount: 1249,
      include: true,
    },
    {
      email: "joel@trustlesswork.com",
      displayName: "Joel",
      address: joel,
      amount: 1249,
      include: true,
    },
    {
      email: "caleb@trustlesswork.com",
      displayName: "Caleb",
      address: joel,
      amount: 1249,
      include: false,
    },
  ],
};

describe("payroll-payload.helper", () => {
  it("maps form values with roles and salary + test milestones", () => {
    const payload = toPayrollDeployPayload(
      formValues,
      signer,
      disputeResolver,
      "mainnet",
    );

    expect(payload.engagementId).toBe("payroll-2026-10-Q1");
    expect(payload.title).toBe("Payroll - 1ra quincena - October 2026");
    expect(payload.platformFee).toBe(0);
    expect(payload.signer).toBe(signer);
    expect(payload.roles.approvers).toEqual([alberto]);
    expect(payload.roles.releaseSigners).toEqual([alberto]);
    expect(payload.roles.serviceProviders).toEqual([alberto]);
    expect(payload.roles.platform).toBe(alberto);
    expect(payload.roles.admin).toBe(alberto);
    expect(payload.roles.disputeResolvers).toEqual([disputeResolver]);
    expect(payload.roles.observers).toEqual([]);
    expect(payload.milestones).toHaveLength(4);
    expect(payload.milestones[0]).toMatchObject({
      amount: 1249,
      receiver: alberto,
    });
    expect(payload.milestones[1]).toMatchObject({
      amount: 1,
      receiver: alberto,
    });
    expect(payload.milestones[1]?.description).toMatch(/^Test transaction/);
    expect(payload.trustline.symbol).toBe("USDC");
  });

  it("on testnet uses template admin and connected-wallet style receivers", () => {
    const testnetValues: PayrollRunFormData = {
      ...formValues,
      members: formValues.members.map((member) => ({
        ...member,
        address: signer,
        include: true,
      })),
    };

    const payload = toPayrollDeployPayload(
      testnetValues,
      signer,
      undefined,
      "testnet",
    );

    expect(payload.roles.admin).toBe(
      "GCK27OWIRLRVHGFOOO67SF5NL2LD5WIQSFAT5MMFEF7AGUOREUL7SBSX",
    );
    expect(payload.roles.approvers).toEqual([signer]);
    expect(payload.roles.releaseSigners).toEqual([signer]);
    expect(payload.roles.disputeResolvers).toEqual([
      "GCWTL5XN22BWFB6QSF4SKYKFQP3G3KTEHUFK7HR7CGRQJFVCO2WVXVLE",
    ]);
    expect(payload.milestones.every((m) => m.receiver === signer)).toBe(true);
  });

  it("sums salary plus 1 USDC test per included member", () => {
    expect(getPayrollRunTotal(formValues)).toBe(2500);
  });
});

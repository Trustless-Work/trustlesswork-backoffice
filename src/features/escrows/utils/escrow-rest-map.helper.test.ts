import { describe, expect, it } from "vitest";
import type { EscrowSummary } from "@trustless-work/escrow";
import {
  mapEscrowSummaryToListItem,
  mapEscrowSummaryToStored,
} from "@/features/escrows/utils/escrow-rest-map.helper";

function buildEscrowSummary(
  overrides?: Partial<EscrowSummary> & { amount?: string | null },
): EscrowSummary & { amount: string | null } {
  return {
    network: "testnet",
    contractId: "CDCONTRACT",
    type: "single-release",
    engagementId: "ENG-1",
    status: "active",
    totalAmount: null,
    amount: "250.5",
    balance: "250.5",
    asset: {
      name: "USDC",
      address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    },
    lastLedgerSeq: "1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    snapshot: {
      title: "Payroll",
      description: "Monthly payroll escrow",
      engagementId: "ENG-1",
      trustline: { address: "CUSDC", symbol: "USDC" },
      platformFee: "2",
      roles: {
        approvers: ["G1"],
        serviceProviders: ["G2"],
        platform: "G3",
        releaseSigners: ["G4"],
        disputeResolvers: ["G5"],
        receiver: "G6",
        admin: "G7",
        observers: ["G8"],
      },
      amount: "1000",
      milestones: [{ description: "Done", approvalsTarget: 1 }],
    },
    ...overrides,
  };
}

describe("mapEscrowSummaryToStored", () => {
  it("maps single-release snapshot into StoredEscrow with API balance", () => {
    const stored = mapEscrowSummaryToStored(buildEscrowSummary());

    expect(stored).toMatchObject({
      type: "single-release",
      contractId: "CDCONTRACT",
      title: "Payroll",
      amount: 1000,
      balance: 250.5,
      status: "active",
      apiVersion: null,
      contractVersion: null,
      roles: expect.objectContaining({
        observers: ["G8"],
      }),
    });
  });

  it("keeps apiVersion from the read model", () => {
    const stored = mapEscrowSummaryToStored(
      Object.assign(buildEscrowSummary(), { apiVersion: "v1" }),
    );

    expect(stored?.apiVersion).toBe("v1");
  });

  it("reads contract generation without using apiVersion", () => {
    const stored = mapEscrowSummaryToStored(
      Object.assign(buildEscrowSummary(), {
        apiVersion: "v1",
        contractVersion: "v2",
      }),
    );

    expect(stored?.apiVersion).toBe("v1");
    expect(stored?.contractVersion).toBe("v2");
  });

  it("treats a missing or unknown contractVersion as null", () => {
    const missing = mapEscrowSummaryToStored(buildEscrowSummary());
    const unknown = mapEscrowSummaryToStored(
      Object.assign(buildEscrowSummary(), { contractVersion: "v3" }),
    );

    expect(missing?.contractVersion).toBeNull();
    expect(unknown?.contractVersion).toBeNull();
  });

  it("allows explicit balance override", () => {
    const stored = mapEscrowSummaryToStored(buildEscrowSummary(), 99);

    expect(stored).toMatchObject({ balance: 99 });
  });
});

describe("mapEscrowSummaryToListItem", () => {
  it("builds list item from summary snapshot", () => {
    const item = mapEscrowSummaryToListItem(buildEscrowSummary());

    expect(item).toMatchObject({
      contractId: "CDCONTRACT",
      title: "Payroll",
      engagementId: "ENG-1",
      balance: 250.5,
      amount: 250.5,
      assetSymbol: "USDC",
      layout: "standard",
      financial: null,
    });
  });

  it("reads engagementId from snapshot when root field is missing", () => {
    const item = mapEscrowSummaryToListItem(
      buildEscrowSummary({
        engagementId: undefined as unknown as string,
        snapshot: {
          ...buildEscrowSummary().snapshot,
          engagementId: "payroll-2026-09-Q2",
        },
      }),
    );

    expect(item?.engagementId).toBe("payroll-2026-09-Q2");
    expect(item?.stored.engagementId).toBe("payroll-2026-09-Q2");
  });

  it("prefers root asset name over trustline symbol", () => {
    const item = mapEscrowSummaryToListItem(
      buildEscrowSummary({
        asset: { name: "EURC", address: null, contractId: null },
        snapshot: {
          ...buildEscrowSummary().snapshot,
          trustline: { address: "CUSDC", symbol: "USDC" },
        },
      }),
    );

    expect(item?.assetSymbol).toBe("EURC");
  });

  it("keeps amount null when the read-model has not projected it", () => {
    const item = mapEscrowSummaryToListItem(
      buildEscrowSummary({ amount: null, totalAmount: "999" }),
    );

    expect(item?.amount).toBeNull();
  });

  it("ignores the removed totalAmount field", () => {
    const item = mapEscrowSummaryToListItem(
      buildEscrowSummary({ amount: "80", totalAmount: "1" }),
    );

    expect(item?.amount).toBe(80);
  });

  it("returns null when snapshot is invalid", () => {
    const item = mapEscrowSummaryToListItem(
      buildEscrowSummary({ snapshot: {} as EscrowSummary["snapshot"] }),
    );

    expect(item).toBeNull();
  });
});

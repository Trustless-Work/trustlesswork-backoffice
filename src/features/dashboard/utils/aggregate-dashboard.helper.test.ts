import { describe, expect, it } from "vitest";
import type {
  EscrowFinancial,
  EscrowSummary,
} from "@trustless-work/escrow";
import {
  aggregateDashboardMetrics,
  buildLastNDayKeys,
  parseDashboardAmount,
  toIsoCalendarDate,
} from "@/features/dashboard/utils/aggregate-dashboard.helper";
import { formatFullCurrency } from "@/helpers/chart-format.helper";

function summary(
  overrides: Partial<EscrowSummary> &
    Pick<EscrowSummary, "contractId" | "status" | "type" | "createdAt"> & {
      amount?: string | null;
    },
): EscrowSummary & { amount: string | null } {
  return {
    network: "testnet",
    engagementId: "eng-1",
    totalAmount: "1",
    amount: "100",
    balance: "40",
    asset: null,
    lastLedgerSeq: "1",
    updatedAt: overrides.createdAt,
    snapshot: {
      title: "Test",
      description: "Desc",
      engagementId: "eng-1",
      trustline: { address: "GTEST", symbol: "USDC" },
      platformFee: "1",
      roles: {
        approvers: ["G1"],
        serviceProviders: ["G2"],
        releaseSigners: ["G3"],
        disputeResolvers: ["G4"],
        receiver: "G5",
        platform: "G6",
        admin: "G6",
      },
      amount: "100",
      milestones: [],
    },
    ...overrides,
  };
}

function financial(
  overrides: Partial<EscrowFinancial> &
    Pick<EscrowFinancial, "contractId"> & { amount?: string | null },
): EscrowFinancial & { amount: string | null } {
  return {
    type: "single-release",
    asset: "USDC",
    platformFee: "1",
    totalAmount: "1",
    amount: "100",
    totalDeposited: "100",
    totalReleased: "30",
    pendingRelease: "20",
    nextRelease: null,
    balance: "50",
    ...overrides,
  };
}

describe("parseDashboardAmount", () => {
  it("parses finite numbers and numeric strings", () => {
    expect(parseDashboardAmount(12.5)).toBe(12.5);
    expect(parseDashboardAmount("40.25")).toBe(40.25);
  });

  it("returns 0 for invalid values", () => {
    expect(parseDashboardAmount(null)).toBe(0);
    expect(parseDashboardAmount("")).toBe(0);
    expect(parseDashboardAmount("abc")).toBe(0);
  });
});

describe("buildLastNDayKeys", () => {
  it("returns N ascending UTC calendar days ending today", () => {
    const now = new Date("2026-05-10T15:00:00.000Z");
    const keys = buildLastNDayKeys(3, now);
    expect(keys).toEqual(["2026-05-08", "2026-05-09", "2026-05-10"]);
  });
});

describe("aggregateDashboardMetrics", () => {
  it("returns empty metrics when there are no escrows", () => {
    const now = new Date("2026-05-10T12:00:00.000Z");
    const metrics = aggregateDashboardMetrics({
      escrows: [],
      financials: [],
      now,
    });

    expect(metrics.createdTotal).toBe(0);
    expect(metrics.volumeLatest).toBe(0);
    expect(metrics.volumeSeries).toHaveLength(30);
    expect(metrics.attention.every((item) => item.count === 0)).toBe(true);
  });

  it("aggregates financial and status metrics for org escrows", () => {
    const now = new Date("2026-05-10T12:00:00.000Z");
    const day = toIsoCalendarDate(now);

    const escrows = [
      summary({
        contractId: "c1",
        status: "active",
        type: "single-release",
        createdAt: `${day}T10:00:00.000Z`,
        balance: "50",
      }),
      summary({
        contractId: "c2",
        status: "disputed",
        type: "multi-release",
        createdAt: `${day}T11:00:00.000Z`,
        balance: "25",
        amount: "80",
        totalAmount: "1",
      }),
      summary({
        contractId: "c3",
        status: "released",
        type: "single-release",
        createdAt: "2026-05-01T10:00:00.000Z",
        balance: "0",
      }),
    ];

    const financials = [
      financial({
        contractId: "c1",
        balance: "50",
        totalDeposited: "100",
        totalReleased: "30",
        pendingRelease: "20",
        platformFee: "2",
        nextRelease: { milestoneIndex: 0, amount: "20" },
      }),
      financial({
        contractId: "c2",
        type: "multi-release",
        balance: "25",
        totalDeposited: "80",
        totalReleased: "0",
        pendingRelease: "0",
        platformFee: "1",
      }),
      financial({
        contractId: "c3",
        balance: "0",
        totalDeposited: "50",
        totalReleased: "50",
        pendingRelease: "0",
        platformFee: "1",
      }),
    ];

    const metrics = aggregateDashboardMetrics({ escrows, financials, now });

    expect(metrics.typeMix.total).toBe(3);
    expect(metrics.typeMix.singleRelease).toBe(2);
    expect(metrics.typeMix.multiRelease).toBe(1);
    expect(metrics.totalDeposited).toBe(230);
    expect(metrics.volumeLatest).toBe(75);
    expect(metrics.createdTotal).toBe(3);
    expect(metrics.nextRelease.amount).toBe(20);
    expect(metrics.nextRelease.contractId).toBe("c1");
    expect(metrics.platformFeesTotal).toBe(4);
    expect(metrics.attention.find((item) => item.id === "disputed")?.count).toBe(
      1,
    );
    expect(
      metrics.attention.find((item) => item.id === "pending-release")?.count,
    ).toBe(1);
    expect(metrics.stats[0]?.label).toBe("Active escrows");
    expect(metrics.budgetSegments.map((segment) => segment.label)).toEqual([
      "Locked",
      "Released",
      "Pending",
    ]);
  });

  it("uses amount for deal size and ignores the removed totalAmount field", () => {
    const metrics = aggregateDashboardMetrics({
      escrows: [
        summary({
          contractId: "c1",
          status: "active",
          type: "single-release",
          createdAt: "2026-05-10T10:00:00.000Z",
          totalAmount: "1",
          amount: "250.5",
          balance: "0",
        }),
      ],
      financials: [
        financial({
          contractId: "c1",
          totalDeposited: "0",
          totalAmount: "999",
          amount: "40",
          balance: "0",
        }),
      ],
      now: new Date("2026-05-10T12:00:00.000Z"),
    });

    expect(metrics.stats[2]?.value).toBe(formatFullCurrency(40));
  });
});

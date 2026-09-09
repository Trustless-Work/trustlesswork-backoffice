import { describe, expect, it } from "vitest";
import {
  aggregateEscrowTypeMix,
  formatAnalyticsEscrowTypeLabel,
} from "@/features/admin-analytics/utils/escrow-type-mix.util";
import type { EscrowsTopResponse } from "@/features/admin-analytics/types/analytics-v2.types";

const asset = {
  address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  symbol: "USDC",
  decimals: 7,
  resolved: true,
} as const;

function board(
  escrows: EscrowsTopResponse["data"][number]["escrows"],
): EscrowsTopResponse["data"][number] {
  return { asset, escrows };
}

describe("formatAnalyticsEscrowTypeLabel", () => {
  it("labels known escrow types", () => {
    expect(formatAnalyticsEscrowTypeLabel("single-release")).toBe(
      "Single release",
    );
    expect(formatAnalyticsEscrowTypeLabel("multi-release")).toBe(
      "Multi release",
    );
    expect(formatAnalyticsEscrowTypeLabel(null)).toBe("Unknown");
  });
});

describe("aggregateEscrowTypeMix", () => {
  it("counts types, shares, and amounts without double-counting ids", () => {
    const summary = aggregateEscrowTypeMix([
      board([
        {
          escrowId: "A",
          engagementId: null,
          type: "single-release",
          status: "active",
          organization: null,
          createdAt: null,
          amount: "100",
          releasedAmount: "0",
          feeAmount: "0.3",
        },
        {
          escrowId: "B",
          engagementId: null,
          type: "multi-release",
          status: "active",
          organization: null,
          createdAt: null,
          amount: "50",
          releasedAmount: "0",
          feeAmount: "0.15",
        },
      ]),
      board([
        {
          escrowId: "A",
          engagementId: null,
          type: "single-release",
          status: "active",
          organization: null,
          createdAt: null,
          amount: "100",
          releasedAmount: "0",
          feeAmount: "0.3",
        },
        {
          escrowId: "C",
          engagementId: null,
          type: null,
          status: "active",
          organization: null,
          createdAt: null,
          amount: "10",
          releasedAmount: "0",
          feeAmount: "0",
        },
      ]),
    ]);

    expect(summary.total).toBe(3);
    expect(summary.singleRelease).toBe(1);
    expect(summary.multiRelease).toBe(1);
    expect(summary.unknown).toBe(1);
    expect(summary.singleSharePct).toBeCloseTo(100 / 3);
    expect(summary.rows.find((row) => row.key === "single-release")?.totalAmount).toBe(
      "100",
    );
    expect(summary.rows.find((row) => row.key === "multi-release")?.totalFee).toBe(
      "0.15",
    );
  });
});

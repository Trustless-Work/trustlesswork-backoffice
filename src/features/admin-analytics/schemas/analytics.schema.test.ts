import { describe, expect, it } from "vitest";
import {
  dataQualityResponseSchema,
  escrowGrowthResponseSchema,
  revenueByTokenResponseSchema,
  revenueEventOrganizationSchema,
  revenueEventsResponseSchema,
  seriesGrowthPointSchema,
  statusFunnelResponseSchema,
  userGrowthResponseSchema,
} from "@/features/admin-analytics/schemas/analytics.schema";

describe("revenueEventOrganizationSchema", () => {
  it("defaults archived when core omits the field", () => {
    const result = revenueEventOrganizationSchema.safeParse({
      id: "20",
      name: "Youyou",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.archived).toBe(false);
    }
  });
});

describe("seriesGrowthPointSchema", () => {
  it("accepts null growthPct and period alias", () => {
    const result = seriesGrowthPointSchema.safeParse({
      period: "2026-08-26",
      month: "2026-08-26",
      count: 12,
      growthPct: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("escrowGrowthResponseSchema", () => {
  it("parses a valid escrow growth response", () => {
    const result = escrowGrowthResponseSchema.safeParse({
      network: "testnet",
      granularity: "day",
      data: [
        {
          period: "2026-08-26",
          month: "2026-08-26",
          count: 25,
          growthPct: -100,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("userGrowthResponseSchema", () => {
  it("parses a valid user growth response", () => {
    const result = userGrowthResponseSchema.safeParse({
      granularity: "month",
      data: [
        {
          period: "2026-08",
          month: "2026-08",
          count: 5,
          growthPct: 25,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("revenueByTokenResponseSchema", () => {
  it("parses decimal string amounts", () => {
    const result = revenueByTokenResponseSchema.safeParse({
      network: "testnet",
      feeBps: 30,
      granularity: "month",
      data: [
        {
          period: "2026-08",
          month: "2026-08",
          asset: {
            address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
            symbol: "USDC",
            decimals: 7,
            resolved: true,
          },
          category: "released",
          releasedAmount: "1250.5",
          feeAmount: "3.7515",
          escrowCount: 7,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("revenueEventsResponseSchema", () => {
  it("parses paginated revenue events", () => {
    const result = revenueEventsResponseSchema.safeParse({
      network: "testnet",
      feeBps: 30,
      data: [
        {
          escrowId: "CBZXBSOQH3EWJHY5JE65QW6ZFJYLXKUAYNGG3PEGNSHHRFVVBLOF3FSQ",
          engagementId: "ENG-2026-041",
          type: "single-release",
          eventType: "release",
          createdAt: "2026-06-09T23:33:46.000Z",
          txHash: "44a4a684cd8dbec745ca1d29855edd2f7eada7ff07e06b831c31102268b6a633",
          organization: { id: "12", name: "Acme Marketplace", archived: false },
          asset: {
            address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
            symbol: "USDC",
            decimals: 7,
            resolved: true,
          },
          amount: "263.5",
          feeAmount: "0.7905",
          attributesRevenue: true,
        },
      ],
      pagination: { limit: 50, offset: 0, total: 41 },
      escrowTotal: 12,
      topOrganizations: [
        {
          organization: { id: "12", name: "Acme Marketplace", archived: false },
          escrowCount: 3,
          byAsset: [
            {
              asset: {
                address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
                symbol: "USDC",
                decimals: 7,
                resolved: true,
              },
              escrowCount: 3,
              releasedAmount: "263.5",
              feeAmount: "0.7905",
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("statusFunnelResponseSchema", () => {
  it("accepts null status buckets", () => {
    const result = statusFunnelResponseSchema.safeParse({
      network: "testnet",
      data: [{ status: null, count: 2 }],
      removedCount: 0,
      shellCount: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("dataQualityResponseSchema", () => {
  it("parses all counters", () => {
    const result = dataQualityResponseSchema.safeParse({
      network: "testnet",
      openGaps: 0,
      shellRows: 1,
      removedEscrows: 3,
      missingChainClock: 0,
      unbackfilledReleased: 0,
    });
    expect(result.success).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  attributingEvents,
  buildCategoryBreakdown,
  buildCategoryLineSeries,
  buildRevenueChartSeries,
  buildRevenueStatSummaries,
  formatFeeBpsPercent,
  groupRevenueByToken,
  isUsdtRevenueAsset,
  resolveAssetSymbol,
} from "@/features/admin-analytics/utils/revenue.util";
import type {
  RevenueBucket,
  RevenueEvent,
} from "@/features/admin-analytics/types/analytics.types";

const usdcAsset = {
  address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  symbol: "USDC",
  decimals: 7,
  resolved: true,
} as const;

const buckets: RevenueBucket[] = [
  {
    period: "2026-07",
    month: "2026-07",
    asset: usdcAsset,
    category: "released",
    releasedAmount: "1000",
    feeAmount: "3",
    escrowCount: 2,
  },
  {
    period: "2026-08",
    month: "2026-08",
    asset: usdcAsset,
    category: "released",
    releasedAmount: "500",
    feeAmount: "1.5",
    escrowCount: 1,
  },
  {
    period: "2026-08",
    month: "2026-08",
    asset: usdcAsset,
    category: "resolved",
    releasedAmount: "200",
    feeAmount: "0.6",
    escrowCount: 1,
  },
];

describe("resolveAssetSymbol", () => {
  it("maps native symbol to XLM", () => {
    expect(
      resolveAssetSymbol({
        address: "native",
        symbol: "native",
        decimals: 7,
        resolved: true,
      }),
    ).toBe("XLM");
  });

  it("maps native address to XLM when symbol is null", () => {
    expect(
      resolveAssetSymbol({
        address: "native",
        symbol: null,
        decimals: 7,
        resolved: true,
      }),
    ).toBe("XLM");
  });

  it("keeps non-native symbols", () => {
    expect(resolveAssetSymbol(usdcAsset)).toBe("USDC");
  });
});

describe("isUsdtRevenueAsset", () => {
  it("identifies USDT0 as the USDT asset", () => {
    expect(
      isUsdtRevenueAsset({
        address: "CUSDTCONTRACTADDRESS000000000000000000000000000000000",
        symbol: "USDT0",
        decimals: 7,
        resolved: true,
      }),
    ).toBe(true);
  });

  it("rejects USDC and native assets", () => {
    expect(isUsdtRevenueAsset(usdcAsset)).toBe(false);
    expect(
      isUsdtRevenueAsset({
        address: "native",
        symbol: "native",
        decimals: 7,
        resolved: true,
      }),
    ).toBe(false);
  });
});

describe("groupRevenueByToken", () => {
  it("sums fees within the same token only", () => {
    const summaries = groupRevenueByToken(buckets);
    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.totalFee).toBe("5.1");
    expect(summaries[0]?.releasedFee).toBe("4.5");
    expect(summaries[0]?.resolvedFee).toBe("0.6");
  });
});

describe("buildRevenueChartSeries", () => {
  it("builds one point per period from dense buckets", () => {
    const series = buildRevenueChartSeries(buckets);
    expect(series).toHaveLength(2);
    expect(series[0]?.period).toBe("2026-07");
    expect(series[0]?.USDC).toBe("3");
    expect(series[1]?.USDC).toBe("2.1");
  });
});

describe("buildCategoryLineSeries", () => {
  it("splits released and resolved fees per period", () => {
    const series = buildCategoryLineSeries(buckets);
    expect(series[1]?.released).toBe("1.5");
    expect(series[1]?.resolved).toBe("0.6");
  });
});

describe("buildCategoryBreakdown", () => {
  it("keeps released and resolved disjoint", () => {
    const breakdown = buildCategoryBreakdown(buckets);
    expect(breakdown.released).toBe("4.5");
    expect(breakdown.resolved).toBe("0.6");
  });
});

describe("buildRevenueStatSummaries", () => {
  it("groups fees into USDC, USDT, XLM, and other trustline buckets", () => {
    const mixedBuckets: RevenueBucket[] = [
      ...buckets,
      {
        period: "2026-08",
        month: "2026-08",
        asset: {
          address: "native",
          symbol: "native",
          decimals: 7,
          resolved: true,
        },
        category: "released",
        releasedAmount: "100",
        feeAmount: "2",
        escrowCount: 1,
      },
      {
        period: "2026-08",
        month: "2026-08",
        asset: {
          address: "CUSDTCONTRACTADDRESS000000000000000000000000000000000",
          symbol: "USDT0",
          decimals: 7,
          resolved: true,
        },
        category: "released",
        releasedAmount: "80",
        feeAmount: "1.2",
        escrowCount: 1,
      },
      {
        period: "2026-08",
        month: "2026-08",
        asset: {
          address: "CABC1234567890",
          symbol: "BRL",
          decimals: 7,
          resolved: true,
        },
        category: "released",
        releasedAmount: "50",
        feeAmount: "0.5",
        escrowCount: 1,
      },
      {
        period: "2026-08",
        month: "2026-08",
        asset: {
          address: "CDEF9876543210",
          symbol: "EURC",
          decimals: 7,
          resolved: false,
        },
        category: "resolved",
        releasedAmount: "20",
        feeAmount: "0.2",
        escrowCount: 1,
      },
    ];

    const summaries = buildRevenueStatSummaries(mixedBuckets);

    expect(summaries).toHaveLength(4);
    expect(summaries[0]).toMatchObject({
      key: "usdc",
      label: "USDC fees",
      totalFee: "5.1",
    });
    expect(summaries[1]).toMatchObject({
      key: "usdt",
      label: "USDT fees",
      totalFee: "1.2",
    });
    expect(summaries[2]).toMatchObject({
      key: "xlm",
      label: "XLM fees",
      totalFee: "2",
    });
    expect(summaries[3]).toMatchObject({
      key: "other",
      label: "Other trustline fees",
      totalFee: "0.7",
      resolved: false,
    });
  });

  it("always shows USDC, USDT, and XLM at zero when they have no fees", () => {
    const summaries = buildRevenueStatSummaries(buckets);

    expect(summaries.map((summary) => summary.key)).toEqual([
      "usdc",
      "usdt",
      "xlm",
    ]);
    expect(summaries[0]).toMatchObject({
      key: "usdc",
      totalFee: "5.1",
    });
    expect(summaries[1]).toMatchObject({
      key: "usdt",
      label: "USDT fees",
      totalFee: "0",
      displayAsset: { symbol: "USDT0" },
    });
    expect(summaries[2]).toMatchObject({
      key: "xlm",
      label: "XLM fees",
      totalFee: "0",
      displayAsset: { symbol: "XLM" },
    });
  });
});

describe("formatFeeBpsPercent", () => {
  it("converts basis points to a human percent", () => {
    expect(formatFeeBpsPercent(30)).toBe("0.3%");
    expect(formatFeeBpsPercent(25)).toBe("0.25%");
    expect(formatFeeBpsPercent(100)).toBe("1%");
  });
});

describe("attributingEvents", () => {
  const baseEvent: RevenueEvent = {
    escrowId: "CBZXBSOQH3EWJHY5JE65QW6ZFJYLXKUAYNGG3PEGNSHHRFVVBLOF3FSQ",
    engagementId: null,
    type: "single-release",
    eventType: "release",
    createdAt: "2026-06-09T23:33:46.000Z",
    txHash: null,
    organization: { id: "1", name: "Acme", archived: false },
    asset: usdcAsset,
    amount: "100",
    feeAmount: "0.3",
    attributesRevenue: false,
  };

  it("keeps only rows with attributesRevenue true", () => {
    const events: RevenueEvent[] = [
      baseEvent,
      { ...baseEvent, attributesRevenue: true, escrowId: "other" },
    ];
    expect(attributingEvents(events)).toHaveLength(1);
    expect(attributingEvents(events)[0]?.attributesRevenue).toBe(true);
  });
});

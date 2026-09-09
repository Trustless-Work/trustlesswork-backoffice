import Decimal from "decimal.js";
import { formatPercent } from "@/helpers/chart-format.helper";
import {
  isUsdcSymbol,
  isUsdtSymbol,
  isXlmSymbol,
} from "@/helpers/format.helper";
import type {
  RevenueAsset,
  RevenueBucket,
  RevenueCategory,
  RevenueEvent,
  RevenueEventType,
} from "@/features/admin-analytics/types/analytics.types";

export const KNOWN_USDC_CONTRACT_IDS = new Set([
  "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
]);

export type RevenueStatGroup = "usdc" | "usdt" | "xlm" | "other";

export type RevenueStatSummary = {
  key: RevenueStatGroup;
  label: string;
  totalFee: string;
  resolved: boolean;
  displayAsset: RevenueAsset | null;
};

export type TokenSummary = {
  address: string;
  symbol: string;
  resolved: boolean;
  releasedFee: string;
  resolvedFee: string;
  totalFee: string;
};

export type RevenueChartPoint = {
  period: string;
  [tokenKey: string]: string | number;
};

export type CategoryLinePoint = {
  period: string;
  released: string;
  resolved: string;
};

export type DonutSlice = {
  key: string;
  label: string;
  value: string;
  color: string;
};

/** Native Stellar asset is exposed as `"native"`; display it as XLM. */
export function resolveAssetSymbol(asset: RevenueAsset): string {
  const symbol = asset.symbol?.trim() ?? "";
  const address = asset.address.trim();

  if (symbol.toLowerCase() === "native" || address.toLowerCase() === "native") {
    return "XLM";
  }

  if (symbol) {
    return symbol;
  }

  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function isUsdcRevenueAsset(asset: RevenueAsset): boolean {
  if (isUsdcSymbol(resolveAssetSymbol(asset))) {
    return true;
  }

  return KNOWN_USDC_CONTRACT_IDS.has(asset.address.trim());
}

export function isUsdtRevenueAsset(asset: RevenueAsset): boolean {
  return isUsdtSymbol(resolveAssetSymbol(asset));
}

export function isXlmRevenueAsset(asset: RevenueAsset): boolean {
  const symbol = asset.symbol?.trim() ?? "";
  const address = asset.address.trim().toLowerCase();

  if (isXlmSymbol(symbol) || address === "native") {
    return true;
  }

  return isXlmSymbol(resolveAssetSymbol(asset));
}

export function classifyRevenueStatGroup(asset: RevenueAsset): RevenueStatGroup {
  if (isUsdcRevenueAsset(asset)) {
    return "usdc";
  }

  if (isUsdtRevenueAsset(asset)) {
    return "usdt";
  }

  if (isXlmRevenueAsset(asset)) {
    return "xlm";
  }

  return "other";
}

const REVENUE_STAT_GROUP_LABELS: Record<RevenueStatGroup, string> = {
  usdc: "USDC fees",
  usdt: "USDT fees",
  xlm: "XLM fees",
  other: "Other trustline fees",
};

const REVENUE_STAT_GROUP_ORDER = ["usdc", "usdt", "xlm", "other"] as const;

const BRANDED_STAT_PLACEHOLDERS: Record<
  Exclude<RevenueStatGroup, "other">,
  RevenueAsset
> = {
  usdc: {
    address: "USDC",
    symbol: "USDC",
    decimals: 7,
    resolved: true,
  },
  usdt: {
    address: "USDT0",
    symbol: "USDT0",
    decimals: 7,
    resolved: true,
  },
  xlm: {
    address: "native",
    symbol: "XLM",
    decimals: 7,
    resolved: true,
  },
};

export function formatFeeBpsPercent(feeBps: number): string {
  const percent = feeBps / 100;
  const fractionDigits =
    percent % 1 === 0 ? 0 : (percent * 10) % 1 === 0 ? 1 : 2;
  return formatPercent(percent, fractionDigits);
}

export function buildRevenueStatSummaries(
  buckets: readonly RevenueBucket[],
): RevenueStatSummary[] {
  const groups: Record<
    RevenueStatGroup,
    { total: Decimal; resolved: boolean; displayAsset: RevenueAsset | null }
  > = {
    usdc: { total: new Decimal(0), resolved: true, displayAsset: null },
    usdt: { total: new Decimal(0), resolved: true, displayAsset: null },
    xlm: { total: new Decimal(0), resolved: true, displayAsset: null },
    other: { total: new Decimal(0), resolved: true, displayAsset: null },
  };

  for (const bucket of buckets) {
    const group = classifyRevenueStatGroup(bucket.asset);
    const entry = groups[group];
    entry.total = entry.total.plus(bucket.feeAmount);

    if (!bucket.asset.resolved) {
      entry.resolved = false;
    }

    entry.displayAsset ??= bucket.asset;
  }

  return REVENUE_STAT_GROUP_ORDER.map((key) => {
    const entry = groups[key];
    const displayAsset =
      entry.displayAsset ??
      (key === "other" ? null : BRANDED_STAT_PLACEHOLDERS[key]);

    return {
      key,
      label: REVENUE_STAT_GROUP_LABELS[key],
      totalFee: entry.total.toString(),
      resolved: entry.resolved,
      displayAsset,
    };
  }).filter(
    (summary) =>
      summary.key !== "other" || new Decimal(summary.totalFee).gt(0),
  );
}

export function getBucketPeriod(bucket: RevenueBucket): string {
  return bucket.period;
}

function tokenKey(asset: RevenueBucket["asset"]): string {
  return resolveAssetSymbol(asset);
}

function sumFees(buckets: readonly RevenueBucket[]): string {
  return buckets
    .reduce((total, bucket) => total.plus(bucket.feeAmount), new Decimal(0))
    .toString();
}

export function groupRevenueByToken(
  buckets: readonly RevenueBucket[],
): TokenSummary[] {
  const byAddress = new Map<
    string,
    {
      asset: RevenueBucket["asset"];
      released: RevenueBucket[];
      resolved: RevenueBucket[];
    }
  >();

  for (const bucket of buckets) {
    const existing = byAddress.get(bucket.asset.address) ?? {
      asset: bucket.asset,
      released: [],
      resolved: [],
    };
    if (bucket.category === "released") {
      existing.released.push(bucket);
    } else {
      existing.resolved.push(bucket);
    }
    byAddress.set(bucket.asset.address, existing);
  }

  return [...byAddress.values()].map(({ asset, released, resolved }) => ({
    address: asset.address,
    symbol: resolveAssetSymbol(asset),
    resolved: asset.resolved,
    releasedFee: sumFees(released),
    resolvedFee: sumFees(resolved),
    totalFee: sumFees([...released, ...resolved]),
  }));
}

export function buildRevenueChartSeries(
  buckets: readonly RevenueBucket[],
): RevenueChartPoint[] {
  const periodKeys = [
    ...new Set(buckets.map((bucket) => getBucketPeriod(bucket))),
  ].sort();
  const tokens = [...new Set(buckets.map((bucket) => tokenKey(bucket.asset)))];

  return periodKeys.map((period) => {
    const point: RevenueChartPoint = { period };
    for (const token of tokens) {
      const periodBuckets = buckets.filter(
        (bucket) =>
          getBucketPeriod(bucket) === period &&
          tokenKey(bucket.asset) === token,
      );
      point[token] = sumFees(periodBuckets);
    }
    return point;
  });
}

export function buildCategoryBreakdown(
  buckets: readonly RevenueBucket[],
): Record<RevenueCategory, string> {
  const released = buckets.filter((bucket) => bucket.category === "released");
  const resolved = buckets.filter((bucket) => bucket.category === "resolved");
  return {
    released: sumFees(released),
    resolved: sumFees(resolved),
  };
}

export function buildCategoryLineSeries(
  buckets: readonly RevenueBucket[],
): CategoryLinePoint[] {
  const periodKeys = [
    ...new Set(buckets.map((bucket) => getBucketPeriod(bucket))),
  ].sort();

  return periodKeys.map((period) => {
    const periodBuckets = buckets.filter(
      (bucket) => getBucketPeriod(bucket) === period,
    );
    const released = periodBuckets.filter(
      (bucket) => bucket.category === "released",
    );
    const resolved = periodBuckets.filter(
      (bucket) => bucket.category === "resolved",
    );
    return {
      period,
      released: sumFees(released),
      resolved: sumFees(resolved),
    };
  });
}

export function buildCategoryDonutSlices(
  buckets: readonly RevenueBucket[],
  colors: readonly string[],
): DonutSlice[] {
  const breakdown = buildCategoryBreakdown(buckets);
  return [
    {
      key: "released",
      label: "Released",
      value: breakdown.released,
      color: colors[0] ?? "var(--chart-1)",
    },
    {
      key: "resolved",
      label: "Resolve",
      value: breakdown.resolved,
      color: colors[1] ?? "var(--chart-2)",
    },
  ].filter((slice) => new Decimal(slice.value).gt(0));
}

export function buildTokenDonutSlices(
  buckets: readonly RevenueBucket[],
  colors: readonly string[],
): DonutSlice[] {
  return groupRevenueByToken(buckets)
    .filter((summary) => new Decimal(summary.totalFee).gt(0))
    .map((summary, index) => ({
      key: summary.address,
      label: summary.resolved ? summary.symbol : `${summary.symbol}*`,
      value: summary.totalFee,
      color: colors[index % colors.length] ?? "var(--chart-1)",
    }));
}

export function countRevenueEscrows(buckets: readonly RevenueBucket[]): number {
  return buckets.reduce((total, bucket) => total + bucket.escrowCount, 0);
}

export function hasUnresolvedAssets(
  buckets: readonly RevenueBucket[],
): boolean {
  return buckets.some((bucket) => !bucket.asset.resolved);
}

export function formatOrganizationName(
  organization: RevenueEvent["organization"],
): string {
  return organization?.name ?? "Unattributed";
}

export function formatEventTypeLabel(eventType: RevenueEventType): string {
  return eventType === "release" ? "Release" : "Resolve";
}

export function countEventsByType(
  events: readonly RevenueEvent[],
): Record<RevenueEventType, number> {
  return events.reduce(
    (counts, event) => {
      counts[event.eventType] += 1;
      return counts;
    },
    { release: 0, resolve_dispute: 0 },
  );
}

/** Rows that count toward revenue totals — one per escrow. */
export function attributingEvents(
  events: readonly RevenueEvent[],
): RevenueEvent[] {
  return events.filter((event) => event.attributesRevenue);
}

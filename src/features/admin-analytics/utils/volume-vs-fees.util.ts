import type { AnalyticsGranularity } from "@/features/admin-analytics/types/analytics.types";
import type { VolumeVsFeesResponse } from "@/features/admin-analytics/types/analytics-v2.types";
import { resolveAssetSymbol } from "@/features/admin-analytics/utils/revenue.util";
import { formatPeriodKey } from "@/helpers/period-key.helper";

export type VolumeVsFeesChartPoint = {
  period: string;
  createdVolume: string;
  releasedVolume: string;
  feeAmount: string;
};

export function densifyVolumeVsFeesSeries(
  response: VolumeVsFeesResponse,
  assetAddress: string,
  granularity: AnalyticsGranularity,
): VolumeVsFeesChartPoint[] {
  const assetBuckets = response.data.filter(
    (bucket) => bucket.asset.address === assetAddress,
  );

  const periodKeys = [
    ...new Set(assetBuckets.map((bucket) => bucket.period)),
  ].sort();

  return periodKeys.map((period) => {
    const bucket = assetBuckets.find((entry) => entry.period === period);
    return {
      period: formatPeriodKey(period, granularity, "short"),
      createdVolume: bucket?.createdVolume ?? "0",
      releasedVolume: bucket?.releasedVolume ?? "0",
      feeAmount: bucket?.feeAmount ?? "0",
    };
  });
}

export function listVolumeVsFeesAssets(
  response: VolumeVsFeesResponse,
): string[] {
  const symbols = new Map<string, string>();
  for (const bucket of response.data) {
    symbols.set(
      bucket.asset.address,
      resolveAssetSymbol(bucket.asset),
    );
  }
  return [...symbols.entries()].map(([address, symbol]) => `${symbol}|${address}`);
}

export function parseVolumeVsFeesAssetKey(key: string): {
  symbol: string;
  address: string;
} {
  const [symbol, address] = key.split("|");
  return { symbol: symbol ?? key, address: address ?? key };
}

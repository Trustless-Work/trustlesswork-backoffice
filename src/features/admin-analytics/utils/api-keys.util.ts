import { formatInteger } from "@/helpers/chart-format.helper";
import type {
  ApiKeysTopBy,
  ApiKeysTopResponse,
} from "@/features/admin-analytics/types/analytics-v2.types";
import { resolveAssetSymbol } from "@/features/admin-analytics/utils/revenue.util";

export type ApiKeyTopItem = ApiKeysTopResponse["data"][number];

export function formatRequestCount(value: string): string {
  try {
    return BigInt(value).toLocaleString("en-US");
  } catch {
    return value;
  }
}

export function compareRequestCounts(left: string, right: string): number {
  try {
    const leftValue = BigInt(left);
    const rightValue = BigInt(right);
    if (leftValue === rightValue) {
      return 0;
    }
    return leftValue > rightValue ? 1 : -1;
  } catch {
    return left.localeCompare(right);
  }
}

export function truncateApiKeyId(value: string): string {
  if (value.length <= 16) {
    return value;
  }
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export function apiKeyDisplayName(item: {
  keyId: string;
  description: string | null;
}): string {
  return item.description?.trim() || truncateApiKeyId(item.keyId);
}

export function apiKeysTopMetricLabel(by: ApiKeysTopBy): string {
  switch (by) {
    case "revenue":
      return "Fee";
    case "volume":
      return "Released";
    case "escrows":
      return "Escrows";
    case "requests":
      return "Requests";
  }
}

export function formatApiKeyTopMetric(
  item: ApiKeyTopItem,
  by: ApiKeysTopBy,
): string {
  if (by === "requests") {
    return formatRequestCount(item.requestCount ?? "0");
  }

  if (by === "escrows") {
    return formatInteger(item.escrowCount ?? 0);
  }

  const assets = item.byAsset ?? [];
  if (assets.length === 0) {
    return formatInteger(item.escrowCount ?? 0);
  }

  if (assets.length === 1) {
    const row = assets[0];
    if (!row) {
      return "—";
    }
    const amount = by === "revenue" ? row.feeAmount : row.releasedAmount;
    return `${amount} ${resolveAssetSymbol(row.asset)}`;
  }

  return `${formatInteger(item.escrowCount ?? 0)} escrows · ${assets.length} assets`;
}

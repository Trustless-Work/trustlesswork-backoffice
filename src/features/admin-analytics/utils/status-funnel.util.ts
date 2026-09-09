import type {
  FunnelStatusKey,
  KnownEscrowStatus,
  StatusBucket,
} from "@/features/admin-analytics/types/analytics.types";
import { KNOWN_ESCROW_STATUSES } from "@/features/admin-analytics/types/analytics.types";

export type FunnelStatusRow = {
  key: FunnelStatusKey;
  label: string;
  count: number;
  color: string;
};

const STATUS_LABELS: Record<KnownEscrowStatus, string> = {
  active: "Active",
  released: "Released",
  disputed: "Disputed",
};

const STATUS_COLORS: Record<FunnelStatusKey, string> = {
  active: "var(--chart-1)",
  released: "var(--chart-2)",
  disputed: "var(--chart-3)",
  other: "var(--chart-4)",
};

function isKnownEscrowStatus(value: string | null): value is KnownEscrowStatus {
  return (
    value !== null &&
    KNOWN_ESCROW_STATUSES.some((status) => status === value)
  );
}

export function normalizeStatusFunnel(
  buckets: readonly StatusBucket[],
): FunnelStatusRow[] {
  const counts = new Map<FunnelStatusKey, number>([
    ["active", 0],
    ["released", 0],
    ["disputed", 0],
    ["other", 0],
  ]);

  for (const bucket of buckets) {
    const key: FunnelStatusKey = isKnownEscrowStatus(bucket.status)
      ? bucket.status
      : "other";
    counts.set(key, (counts.get(key) ?? 0) + bucket.count);
  }

  return (["active", "released", "disputed", "other"] as const).map(
    (key) => ({
      key,
      label: key === "other" ? "Other" : STATUS_LABELS[key],
      count: counts.get(key) ?? 0,
      color: STATUS_COLORS[key],
    }),
  );
}

export function funnelLiveTotal(rows: readonly FunnelStatusRow[]): number {
  return rows.reduce((total, row) => total + row.count, 0);
}

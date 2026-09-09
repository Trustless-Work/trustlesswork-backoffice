import Decimal from "decimal.js";
import type { AnalyticsEscrowType } from "@/features/admin-analytics/types/analytics.types";
import type { EscrowsTopResponse } from "@/features/admin-analytics/types/analytics-v2.types";

export const ANALYTICS_ESCROW_TYPES = [
  "single-release",
  "multi-release",
] as const satisfies readonly AnalyticsEscrowType[];

export type EscrowTypeMixKey = AnalyticsEscrowType | "unknown";

export type EscrowTypeMixRow = {
  key: EscrowTypeMixKey;
  label: string;
  count: number;
  sharePct: number | null;
  totalAmount: string;
  totalFee: string;
  color: string;
};

export type EscrowTypeMixSummary = {
  total: number;
  rows: EscrowTypeMixRow[];
  singleRelease: number;
  multiRelease: number;
  unknown: number;
  singleSharePct: number | null;
  multiSharePct: number | null;
};

const TYPE_LABELS: Record<EscrowTypeMixKey, string> = {
  "single-release": "Single release",
  "multi-release": "Multi release",
  unknown: "Unknown",
};

const TYPE_COLORS: Record<EscrowTypeMixKey, string> = {
  "single-release": "var(--chart-1)",
  "multi-release": "var(--chart-2)",
  unknown: "var(--chart-4)",
};

export function formatAnalyticsEscrowTypeLabel(
  type: AnalyticsEscrowType | null | undefined,
): string {
  if (type === "single-release" || type === "multi-release") {
    return TYPE_LABELS[type];
  }
  return TYPE_LABELS.unknown;
}

export function isAnalyticsEscrowType(
  value: string | null | undefined,
): value is AnalyticsEscrowType {
  return (
    value === "single-release" || value === "multi-release"
  );
}

function sharePct(count: number, total: number): number | null {
  if (total <= 0) {
    return null;
  }
  return (count / total) * 100;
}

type TopEscrowRow = EscrowsTopResponse["data"][number]["escrows"][number];

function resolveTypeKey(type: TopEscrowRow["type"]): EscrowTypeMixKey {
  return isAnalyticsEscrowType(type) ? type : "unknown";
}

export function aggregateEscrowTypeMix(
  boards: EscrowsTopResponse["data"],
): EscrowTypeMixSummary {
  const counts: Record<EscrowTypeMixKey, number> = {
    "single-release": 0,
    "multi-release": 0,
    unknown: 0,
  };
  const amounts: Record<EscrowTypeMixKey, Decimal> = {
    "single-release": new Decimal(0),
    "multi-release": new Decimal(0),
    unknown: new Decimal(0),
  };
  const fees: Record<EscrowTypeMixKey, Decimal> = {
    "single-release": new Decimal(0),
    "multi-release": new Decimal(0),
    unknown: new Decimal(0),
  };

  const seen = new Set<string>();

  for (const board of boards) {
    for (const escrow of board.escrows) {
      if (seen.has(escrow.escrowId)) {
        continue;
      }
      seen.add(escrow.escrowId);

      const key = resolveTypeKey(escrow.type);
      counts[key] += 1;

      if (escrow.amount) {
        amounts[key] = amounts[key].plus(escrow.amount);
      }
      if (escrow.feeAmount) {
        fees[key] = fees[key].plus(escrow.feeAmount);
      }
    }
  }

  const total =
    counts["single-release"] + counts["multi-release"] + counts.unknown;

  const keys: EscrowTypeMixKey[] =
    counts.unknown > 0
      ? ["single-release", "multi-release", "unknown"]
      : ["single-release", "multi-release"];

  const rows = keys.map((key) => ({
    key,
    label: TYPE_LABELS[key],
    count: counts[key],
    sharePct: sharePct(counts[key], total),
    totalAmount: amounts[key].toFixed(),
    totalFee: fees[key].toFixed(),
    color: TYPE_COLORS[key],
  }));

  return {
    total,
    rows,
    singleRelease: counts["single-release"],
    multiRelease: counts["multi-release"],
    unknown: counts.unknown,
    singleSharePct: sharePct(counts["single-release"], total),
    multiSharePct: sharePct(counts["multi-release"], total),
  };
}

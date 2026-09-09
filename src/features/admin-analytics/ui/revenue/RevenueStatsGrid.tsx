"use client";

import { useMemo } from "react";
import { formatInteger } from "@/helpers/chart-format.helper";
import { formatAssetAmount } from "@/helpers/format.helper";
import { StatGrid } from "@/components/dashboard/stat-grid";
import { RevenueAssetAmount } from "@/features/admin-analytics/ui/RevenueAssetAmount";
import {
  buildRevenueStatSummaries,
  formatEventTypeLabel,
  formatFeeBpsPercent,
} from "@/features/admin-analytics/utils/revenue.util";
import type { RevenueBucket } from "@/features/admin-analytics/types/analytics.types";
import type { RevenueEventType } from "@/features/admin-analytics/types/analytics.types";

type RevenueStatsGridProps = {
  buckets: readonly RevenueBucket[];
  feeBps?: number;
  eventsTotal: number;
  eventsPending: boolean;
  eventType?: RevenueEventType;
};

export const RevenueStatsGrid = ({
  buckets,
  feeBps,
  eventsTotal,
  eventsPending,
  eventType,
}: RevenueStatsGridProps) => {
  const statSummaries = useMemo(
    () => buildRevenueStatSummaries(buckets),
    [buckets],
  );

  const stats = useMemo(() => {
    const tokenStats = statSummaries.map((summary) => ({
      label: summary.label,
      value:
        summary.key === "other" || summary.displayAsset === null ? (
          <span className="font-medium text-2xl tabular-nums tracking-tight">
            {formatAssetAmount(Number(summary.totalFee))}
            {!summary.resolved ? (
              <span className="text-muted-foreground text-xs"> *</span>
            ) : null}
          </span>
        ) : (
          <RevenueAssetAmount
            amount={summary.totalFee}
            asset={summary.displayAsset}
            emphasis
            size="2xl"
          />
        ),
      delta: null,
      hint: summary.resolved ? "platform take" : "scale unverified",
    }));

    const metaStats = [];

    if (feeBps !== undefined) {
      metaStats.push({
        label: "Platform fee rate",
        value: formatFeeBpsPercent(feeBps),
        delta: null,
        hint: "on released volume",
      });
    }

    metaStats.push({
      label: "Revenue events",
      value: eventsPending ? "—" : formatInteger(eventsTotal),
      delta: null,
      hint: eventType
        ? `${formatEventTypeLabel(eventType)} only`
        : "in selected range",
    });

    return [...tokenStats, ...metaStats];
  }, [eventType, eventsPending, eventsTotal, feeBps, statSummaries]);

  if (stats.length === 0) {
    return null;
  }

  return <StatGrid columns={3} stats={stats} />;
};

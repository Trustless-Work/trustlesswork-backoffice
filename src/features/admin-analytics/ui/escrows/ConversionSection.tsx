"use client";

import { Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { StatGrid } from "@/components/dashboard/stat-grid";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatInteger, formatPercent } from "@/helpers/chart-format.helper";
import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import { useEscrowConversion } from "@/features/admin-analytics/hooks/useAdminAnalytics";
import { resolveResponseGranularity } from "@/features/admin-analytics/utils/analytics-range.util";
import { isTrailingCohortIndex } from "@/features/admin-analytics/utils/top-organizations.util";
import { formatPeriodKey } from "@/helpers/period-key.helper";

type ConversionSectionProps = {
  range: AnalyticsRange;
};

const chartConfig = {
  conversionPct: {
    label: "Conversion %",
    color: "var(--chart-3)",
  },
};

export const ConversionSection = ({ range }: ConversionSectionProps) => {
  const query = useEscrowConversion(range);

  if (query.isPending || !query.data) {
    return null;
  }

  const granularity = resolveResponseGranularity(
    query.data.granularity,
    range.granularity,
  );
  const series = query.data.data.map((bucket, index) => ({
    period: formatPeriodKey(bucket.period, granularity, "short"),
    conversionPct: bucket.conversionPct ?? 0,
    isMaturing: isTrailingCohortIndex(
      index,
      query.data.data.length,
      granularity,
    ),
  }));

  const trailingStart = series.findIndex((point) => point.isMaturing);
  const trailingLabel =
    trailingStart >= 0 ? series[trailingStart]?.period : null;

  return (
    <DashboardCard className="gap-4">
      <StatGrid
        columns={3}
        stats={[
          {
            label: "Created",
            value: formatInteger(query.data.totals.created),
            delta: null,
            hint: "in cohorts",
          },
          {
            label: "Converted",
            value: formatInteger(query.data.totals.converted),
            delta: null,
            hint: "released value",
          },
          {
            label: "Conversion",
            value:
              query.data.totals.conversionPct === null
                ? "—"
                : formatPercent(query.data.totals.conversionPct),
            delta: null,
            hint: "all cohorts",
          },
        ]}
      />
      <p className="text-muted-foreground text-xs">
        Trailing cohorts are shaded — recent buckets have not had time to
        convert yet.
      </p>
      <ChartContainer className="aspect-16/5 w-full" config={chartConfig}>
        <LineChart accessibilityLayer data={series}>
          <XAxis axisLine={false} dataKey="period" tickLine={false} />
          <YAxis axisLine={false} tickLine={false} width={48} />
          {trailingLabel ? (
            <ReferenceArea
              fill="var(--muted)"
              fillOpacity={0.35}
              x1={trailingLabel}
              x2={series[series.length - 1]?.period}
            />
          ) : null}
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="conversionPct"
            dot={false}
            stroke="var(--color-conversionPct)"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ChartContainer>
    </DashboardCard>
  );
};

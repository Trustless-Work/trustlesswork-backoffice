"use client";

import { useMemo } from "react";
import {
  FilterIcon,
  GaugeIcon,
  PercentIcon,
  TrophyIcon,
} from "lucide-react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { StatGrid } from "@/components/dashboard/stat-grid";
import {
  DashboardCard,
  DashboardCardSeparator,
  DashboardCardTitle,
} from "@/components/dashboard/dashboard-card";
import { cn } from "@/lib/utils";
import { formatInteger } from "@/helpers/chart-format.helper";
import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import type { EscrowsTopBy } from "@/features/admin-analytics/types/analytics-v2.types";
import { useStatusFunnel } from "@/features/admin-analytics/hooks/useAdminAnalytics";
import { AnalyticsSection } from "@/features/admin-analytics/ui/AnalyticsSection";
import { DonutChart } from "@/features/admin-analytics/ui/charts/DonutChart";
import { ConversionSection } from "@/features/admin-analytics/ui/escrows/ConversionSection";
import { EscrowTypeMixSection } from "@/features/admin-analytics/ui/escrows/EscrowTypeMixSection";
import { TopEscrowsBoard } from "@/features/admin-analytics/ui/escrows/TopEscrowsBoard";
import {
  funnelLiveTotal,
  normalizeStatusFunnel,
} from "@/features/admin-analytics/utils/status-funnel.util";
import { EscrowsTabSkeleton } from "@/features/admin-analytics/ui/tabs/EscrowsTabSkeleton";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const funnelChartConfig = {
  count: {
    label: "Escrows",
    color: "var(--chart-1)",
  },
};

type EscrowsTabProps = {
  range: AnalyticsRange;
  topBy: EscrowsTopBy;
};

export const EscrowsTab = ({ range, topBy }: EscrowsTabProps) => {
  const query = useStatusFunnel(range);
  const rows = useMemo(
    () => normalizeStatusFunnel(query.data?.data ?? []),
    [query.data?.data],
  );

  const liveTotal = funnelLiveTotal(rows);
  const donutSlices = useMemo(
    () =>
      rows
        .filter((row) => row.count > 0)
        .map((row, index) => ({
          key: row.key,
          label: row.label,
          value: String(row.count),
          color:
            row.color ??
            CHART_COLORS[index % CHART_COLORS.length] ??
            "var(--chart-1)",
        })),
    [rows],
  );

  const stats = useMemo(
    () => [
      {
        label: "Live escrows",
        value: formatInteger(liveTotal),
        delta: null,
        hint: "in status funnel",
      },
      {
        label: "Removed on-chain",
        value: formatInteger(query.data?.removedCount ?? 0),
        delta: null,
        hint: "excluded from funnel",
      },
      {
        label: "Shell rows",
        value: formatInteger(query.data?.shellCount ?? 0),
        delta: null,
        hint: "awaiting projection",
      },
      {
        label: "Network",
        value: query.data?.network ?? "—",
        delta: null,
        hint: "deployment",
      },
    ],
    [
      liveTotal,
      query.data?.removedCount,
      query.data?.shellCount,
      query.data?.network,
    ],
  );

  if (query.isPending) {
    return <EscrowsTabSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {query.errorMessage ? (
        <p className="text-pretty text-muted-foreground text-sm">
          {query.errorMessage}
        </p>
      ) : null}

      <AnalyticsSection
        description="Snapshot of live escrow health in the selected range. Escrows without a chain clock are excluded when date bounds apply."
        icon={GaugeIcon}
        title="Overview"
      >
        <StatGrid columns={4} stats={stats} />
      </AnalyticsSection>

      <AnalyticsSection
        description="Where live escrows sit in the lifecycle funnel and how that mix distributes."
        icon={FilterIcon}
        title="Status funnel"
      >
        <div
          className={cn(
            "grid grid-cols-1 gap-4",
            "lg:grid-cols-[.68fr_.32fr] xl:grid-cols-[.70fr_.30fr]",
          )}
        >
          <DashboardCard className="gap-4">
            <DashboardCardTitle>By status</DashboardCardTitle>
            <ChartContainer
              className="aspect-16/5 w-full"
              config={funnelChartConfig}
            >
              <BarChart accessibilityLayer data={[...rows]} layout="vertical">
                <XAxis axisLine={false} tickLine={false} type="number" />
                <YAxis
                  axisLine={false}
                  dataKey="label"
                  tickLine={false}
                  type="category"
                  width={80}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {rows.map((row) => (
                    <Cell key={row.key} fill={row.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </DashboardCard>

          <div className="relative flex flex-col gap-4">
            <DashboardCardSeparator
              className="absolute inset-y-0 -left-2 hidden h-full w-px lg:block"
              orientation="vertical"
            />
            <DashboardCardSeparator className="block lg:hidden" />

            <DashboardCard className="gap-4">
              <DashboardCardTitle>Distribution</DashboardCardTitle>
              <DonutChart
                emptyDescription="No live escrows to chart."
                emptyTitle="Empty funnel"
                slices={donutSlices}
              />
            </DashboardCard>
          </div>
        </div>
      </AnalyticsSection>

      <EscrowTypeMixSection range={range} topBy={topBy} />

      <AnalyticsSection
        description="Share of created cohorts that reach a release within the selected window."
        icon={PercentIcon}
        title="Conversion"
      >
        <ConversionSection range={range} />
      </AnalyticsSection>

      <AnalyticsSection
        description={
          topBy === "amount"
            ? "Live escrows only, ranked by funded value."
            : "Revenue population (includes removed escrows), ranked by fees earned."
        }
        icon={TrophyIcon}
        title="Top escrows"
      >
        <TopEscrowsBoard by={topBy} range={range} />
      </AnalyticsSection>
    </div>
  );
};

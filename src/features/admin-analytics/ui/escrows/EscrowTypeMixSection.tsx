"use client";

import { useMemo } from "react";
import { LayersIcon } from "lucide-react";
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
import {
  formatInteger,
  formatPercent,
} from "@/helpers/chart-format.helper";
import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import type { EscrowsTopBy } from "@/features/admin-analytics/types/analytics-v2.types";
import { useEscrowsTop } from "@/features/admin-analytics/hooks/useAdminAnalytics";
import { AnalyticsSection } from "@/features/admin-analytics/ui/AnalyticsSection";
import { DonutChart } from "@/features/admin-analytics/ui/charts/DonutChart";
import { aggregateEscrowTypeMix } from "@/features/admin-analytics/utils/escrow-type-mix.util";

const TYPE_MIX_LIMIT = 50;

const typeChartConfig = {
  count: {
    label: "Escrows",
    color: "var(--chart-1)",
  },
};

type EscrowTypeMixSectionProps = {
  range: AnalyticsRange;
  topBy: EscrowsTopBy;
};

export const EscrowTypeMixSection = ({
  range,
  topBy,
}: EscrowTypeMixSectionProps) => {
  const query = useEscrowsTop(range, topBy, TYPE_MIX_LIMIT);
  const mix = useMemo(
    () => aggregateEscrowTypeMix(query.data?.data ?? []),
    [query.data?.data],
  );

  const donutSlices = useMemo(
    () =>
      mix.rows
        .filter((row) => row.count > 0)
        .map((row) => ({
          key: row.key,
          label: row.label,
          value: String(row.count),
          color: row.color,
        })),
    [mix.rows],
  );

  const stats = useMemo(
    () => [
      {
        label: "In sample",
        value: formatInteger(mix.total),
        delta: null,
        hint: "top escrows / asset",
      },
      {
        label: "Single release",
        value: formatInteger(mix.singleRelease),
        delta: null,
        hint:
          mix.singleSharePct == null
            ? "of sample"
            : `${formatPercent(mix.singleSharePct, 1)} of sample`,
      },
      {
        label: "Multi release",
        value: formatInteger(mix.multiRelease),
        delta: null,
        hint:
          mix.multiSharePct == null
            ? "of sample"
            : `${formatPercent(mix.multiSharePct, 1)} of sample`,
      },
      {
        label: "Unknown type",
        value: formatInteger(mix.unknown),
        delta: null,
        hint: "missing type field",
      },
    ],
    [mix],
  );

  if (query.isPending) {
    return null;
  }

  return (
    <AnalyticsSection
      description="How top-ranked escrows split between single- and multi-release in the selected range (per-asset leaderboard sample)."
      icon={LayersIcon}
      title="Escrow types"
    >
      {query.errorMessage ? (
        <p className="text-pretty text-muted-foreground text-sm">
          {query.errorMessage}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <StatGrid columns={4} stats={stats} />

          <div
            className={cn(
              "grid grid-cols-1 gap-4",
              "lg:grid-cols-[.68fr_.32fr] xl:grid-cols-[.70fr_.30fr]",
            )}
          >
            <DashboardCard className="gap-4">
              <DashboardCardTitle>By type</DashboardCardTitle>
              <ChartContainer
                className="aspect-16/5 w-full"
                config={typeChartConfig}
              >
                <BarChart
                  accessibilityLayer
                  data={[...mix.rows]}
                  layout="vertical"
                >
                  <XAxis axisLine={false} tickLine={false} type="number" />
                  <YAxis
                    axisLine={false}
                    dataKey="label"
                    tickLine={false}
                    type="category"
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {mix.rows.map((row) => (
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
                  emptyDescription="No typed escrows in the top sample."
                  emptyTitle="Empty type mix"
                  slices={donutSlices}
                />
              </DashboardCard>
            </div>
          </div>
        </div>
      )}
    </AnalyticsSection>
  );
};

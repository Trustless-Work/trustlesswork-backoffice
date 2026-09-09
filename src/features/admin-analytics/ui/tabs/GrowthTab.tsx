"use client";

import { useMemo } from "react";
import { curveMonotoneX } from "@visx/curve";
import type { CSSProperties } from "react";
import {
  ArrowLeftRightIcon,
  GaugeIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis as VisxXAxis } from "@/components/charts/x-axis";
import { YAxis as VisxYAxis } from "@/components/charts/y-axis";
import { StatGrid } from "@/components/dashboard/stat-grid";
import {
  DashboardCard,
  DashboardCardSeparator,
  DashboardCardTitle,
} from "@/components/dashboard/dashboard-card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/dashboard/delta";
import { Separator } from "@/components/ui/separator";
import { formatInteger } from "@/helpers/chart-format.helper";
import { growthHintLabel } from "@/helpers/period-key.helper";
import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import {
  useEscrowGrowth,
  useUserGrowth,
} from "@/features/admin-analytics/hooks/useAdminAnalytics";
import { resolveResponseGranularity } from "@/features/admin-analytics/utils/analytics-range.util";
import { AnalyticsSection } from "@/features/admin-analytics/ui/AnalyticsSection";
import { GrowthComparisonLineChart } from "@/features/admin-analytics/ui/charts/GrowthComparisonLineChart";
import { GrowthPeriodBarChart } from "@/features/admin-analytics/ui/charts/GrowthPeriodBarChart";
import {
  latestGrowthPct,
  peakSeriesPoint,
  sumSeriesCounts,
  toAreaChartSeries,
  toComparisonLineSeries,
} from "@/features/admin-analytics/utils/growth.util";
import { GrowthTabSkeleton } from "@/features/admin-analytics/ui/tabs/GrowthTabSkeleton";

const ESCROW_COLOR = "var(--chart-1)";

type GrowthTabProps = {
  range: AnalyticsRange;
};

export const GrowthTab = ({ range }: GrowthTabProps) => {
  const escrowQuery = useEscrowGrowth(range);
  const usersQuery = useUserGrowth(range);

  const isLoading = escrowQuery.isPending || usersQuery.isPending;
  const errorMessage = escrowQuery.errorMessage ?? usersQuery.errorMessage;

  const escrowData = useMemo(
    () => escrowQuery.data?.data ?? [],
    [escrowQuery.data?.data],
  );
  const userData = useMemo(
    () => usersQuery.data?.data ?? [],
    [usersQuery.data?.data],
  );
  const granularity = resolveResponseGranularity(
    escrowQuery.data?.granularity ?? usersQuery.data?.granularity,
    range.granularity,
  );

  const stats = useMemo(
    () => [
      {
        label: "Escrows created",
        value: formatInteger(sumSeriesCounts(escrowData)),
        delta: latestGrowthPct(escrowData),
        hint: "in selected range",
      },
      {
        label: "User sign-ups",
        value: formatInteger(sumSeriesCounts(userData)),
        delta: latestGrowthPct(userData),
        hint: "in selected range",
      },
      {
        label: "Peak escrows",
        value: formatInteger(peakSeriesPoint(escrowData)?.count ?? 0),
        delta: null,
        hint: "best bucket in range",
      },
      {
        label: "Network",
        value: escrowQuery.data?.network ?? "—",
        delta: null,
        hint: "deployment",
      },
    ],
    [escrowData, userData, escrowQuery.data?.network],
  );

  const escrowChartData = useMemo(
    () => toAreaChartSeries(escrowData) as Record<string, unknown>[],
    [escrowData],
  );
  const comparisonData = useMemo(
    () => toComparisonLineSeries(escrowData, userData),
    [escrowData, userData],
  );

  const latestEscrowCount = escrowData[escrowData.length - 1]?.count ?? 0;
  const escrowDelta = latestGrowthPct(escrowData) ?? 0;

  if (isLoading) {
    return <GrowthTabSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {errorMessage ? (
        <p className="text-pretty text-muted-foreground text-sm">
          {errorMessage}
        </p>
      ) : null}

      <AnalyticsSection
        description="Escrow creation and user sign-ups for the selected range."
        icon={GaugeIcon}
        title="Overview"
      >
        <StatGrid columns={4} stats={stats} />
      </AnalyticsSection>

      <AnalyticsSection
        description="Escrow creation trend and period breakdown."
        icon={TrendingUpIcon}
        title="Escrow trends"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
          <DashboardCard className="gap-4">
            <DashboardCardSeparator
              className="absolute bottom-0 lg:hidden"
              orientation="horizontal"
            />
            <DashboardCardSeparator
              className="absolute right-0 hidden h-full lg:block"
              orientation="vertical"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <DashboardCardTitle>Escrows created</DashboardCardTitle>
                <Separator className="h-3.5" orientation="vertical" />
                <span className="font-medium text-foreground text-xs tabular-nums">
                  {formatInteger(latestEscrowCount)} latest
                </span>
              </div>
              <div className="inline-flex items-center gap-1 text-xs">
                {latestGrowthPct(escrowData) === null ? (
                  <span className="text-muted-foreground tabular-nums">—</span>
                ) : (
                  <Delta value={escrowDelta}>
                    <DeltaIcon filled variant="arrow" />
                    <DeltaValue />
                  </Delta>
                )}
                <span className="text-muted-foreground">
                  {growthHintLabel(granularity)}
                </span>
              </div>
            </div>
            <div
              className="w-full"
              style={{ "--chart-crosshair": ESCROW_COLOR } as CSSProperties}
            >
              <AreaChart
                className="aspect-auto h-64 w-full md:h-72"
                data={escrowChartData}
                margin={{ top: 0, right: 28, bottom: 42, left: 32 }}
                xDataKey="date"
              >
                <Grid stroke="var(--border)" />
                <Area
                  curve={curveMonotoneX}
                  dataKey="volume"
                  fadeEdges
                  fill={ESCROW_COLOR}
                  stroke={ESCROW_COLOR}
                  strokeWidth={2}
                />
                <VisxXAxis numTicks={6} tickerHalfWidth={44} />
                <VisxYAxis />
                <ChartTooltip
                  rows={(point) => [
                    {
                      label: "Escrows",
                      value: formatInteger(point.volume as number),
                      color: ESCROW_COLOR,
                    },
                  ]}
                />
              </AreaChart>
            </div>
          </DashboardCard>

          <DashboardCard className="gap-4">
            <DashboardCardTitle>Escrows created by period</DashboardCardTitle>
            <GrowthPeriodBarChart
              data={comparisonData}
              granularity={granularity}
              variant="escrows"
            />
          </DashboardCard>
        </div>
      </AnalyticsSection>

      <AnalyticsSection
        description="Side-by-side view of sign-ups against escrow creation."
        icon={ArrowLeftRightIcon}
        title="Escrows vs sign-ups"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
          <DashboardCard className="gap-4">
            <DashboardCardSeparator
              className="absolute bottom-0 lg:hidden"
              orientation="horizontal"
            />
            <DashboardCardSeparator
              className="absolute right-0 hidden h-full lg:block"
              orientation="vertical"
            />

            <DashboardCardTitle>
              Sign-ups and escrows by period
            </DashboardCardTitle>
            <GrowthPeriodBarChart
              data={comparisonData}
              granularity={granularity}
              variant="combined"
            />
          </DashboardCard>

          <DashboardCard className="gap-4">
            <DashboardCardTitle>Escrows vs sign-ups</DashboardCardTitle>
            <GrowthComparisonLineChart
              data={comparisonData}
              granularity={granularity}
            />
          </DashboardCard>
        </div>
      </AnalyticsSection>
    </div>
  );
};

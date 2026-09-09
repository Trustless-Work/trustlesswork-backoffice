"use client";

import { cn } from "@/lib/utils";
import {
  DashboardCard,
  DashboardCardSeparator,
  DashboardCardTitle,
} from "@/components/dashboard/dashboard-card";
import type { PeriodGranularity } from "@/helpers/period-key.helper";
import type {
  CategoryLinePoint,
  DonutSlice,
} from "@/features/admin-analytics/utils/revenue.util";
import { CategoryFeeLineChart } from "@/features/admin-analytics/ui/charts/CategoryFeeLineChart";
import { DonutChart } from "@/features/admin-analytics/ui/charts/DonutChart";
import { RevenueTokenBarChart } from "@/features/admin-analytics/ui/revenue/RevenueTokenBarChart";
import type { RevenueChartPoint } from "@/features/admin-analytics/utils/revenue.util";

type RevenueChartsSectionProps = {
  chartSeries: readonly RevenueChartPoint[];
  chartConfig: Record<string, { label: string; color: string }>;
  tokenKeys: readonly string[];
  granularity: PeriodGranularity;
  categoryLineSeries: readonly CategoryLinePoint[];
  categorySlices: readonly DonutSlice[];
  tokenSlices: readonly DonutSlice[];
};

export const RevenueChartsSection = ({
  chartSeries,
  chartConfig,
  tokenKeys,
  granularity,
  categoryLineSeries,
  categorySlices,
  tokenSlices,
}: RevenueChartsSectionProps) => (
  <div
    className={cn(
      "grid grid-cols-1 gap-4",
      "lg:grid-cols-[.68fr_.32fr] xl:grid-cols-[.70fr_.30fr]",
    )}
  >
    <div className="flex flex-col gap-4">
      <RevenueTokenBarChart
        chartConfig={chartConfig}
        chartSeries={chartSeries}
        granularity={granularity}
        tokenKeys={tokenKeys}
      />
      <DashboardCardSeparator />
      <DashboardCard className="gap-4">
        <DashboardCardTitle>Released vs resolve fees</DashboardCardTitle>
        <CategoryFeeLineChart
          data={categoryLineSeries}
          granularity={granularity}
        />
      </DashboardCard>
    </div>

    <div className="relative flex flex-col gap-4">
      <DashboardCardSeparator
        className="absolute inset-y-0 -left-2 hidden h-full w-px lg:block"
        orientation="vertical"
      />
      <DashboardCardSeparator className="block lg:hidden" />

      <DashboardCard className="gap-4">
        <DashboardCardTitle>Fee mix by category</DashboardCardTitle>
        <DonutChart
          emptyDescription="No fee revenue in the selected range."
          emptyTitle="No category split"
          slices={categorySlices}
        />
      </DashboardCard>

      <DashboardCard className="gap-4">
        <DashboardCardTitle>Fee share by token</DashboardCardTitle>
        <DonutChart
          emptyDescription="No token fees in the selected range."
          emptyTitle="No token split"
          slices={tokenSlices}
        />
      </DashboardCard>
    </div>
  </div>
);

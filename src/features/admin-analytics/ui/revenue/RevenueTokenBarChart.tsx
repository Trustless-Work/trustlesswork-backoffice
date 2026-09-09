"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DashboardCard,
  DashboardCardTitle,
} from "@/components/dashboard/dashboard-card";
import type { PeriodGranularity } from "@/helpers/period-key.helper";
import { formatPeriodKey } from "@/helpers/period-key.helper";
import type { RevenueChartPoint } from "@/features/admin-analytics/utils/revenue.util";

type RevenueTokenBarChartProps = {
  chartSeries: readonly RevenueChartPoint[];
  chartConfig: Record<string, { label: string; color: string }>;
  tokenKeys: readonly string[];
  granularity: PeriodGranularity;
};

export const RevenueTokenBarChart = ({
  chartSeries,
  chartConfig,
  tokenKeys,
  granularity,
}: RevenueTokenBarChartProps) => (
  <DashboardCard className="gap-4">
    <DashboardCardTitle>Platform take by token</DashboardCardTitle>
    <ChartContainer className="aspect-16/5 w-full" config={chartConfig}>
      <BarChart accessibilityLayer data={[...chartSeries]}>
        <XAxis
          axisLine={false}
          dataKey="period"
          tickFormatter={(value) =>
            formatPeriodKey(String(value), granularity, "short")
          }
          tickLine={false}
        />
        <YAxis axisLine={false} tickLine={false} width={48} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                formatPeriodKey(String(value), granularity, "full")
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {tokenKeys.map((token) => (
          <Bar
            key={token}
            dataKey={token}
            fill={`var(--color-${token})`}
            stackId="revenue"
          />
        ))}
      </BarChart>
    </ChartContainer>
  </DashboardCard>
);

"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { PeriodGranularity } from "@/helpers/period-key.helper";
import { formatPeriodKey } from "@/helpers/period-key.helper";
import { cn } from "@/lib/utils";
import type { ComparisonLinePoint } from "@/features/admin-analytics/ui/charts/GrowthComparisonLineChart";

type GrowthPeriodBarChartProps = {
  data: readonly ComparisonLinePoint[];
  granularity: PeriodGranularity;
  variant: "escrows" | "combined";
  className?: string;
};

const escrowsChartConfig = {
  escrows: {
    label: "Escrows created",
    color: "var(--chart-1)",
  },
};

const combinedChartConfig = {
  escrows: {
    label: "Escrows created",
    color: "var(--chart-1)",
  },
  users: {
    label: "Sign-ups",
    color: "var(--chart-3)",
  },
};

export const GrowthPeriodBarChart = ({
  data,
  granularity,
  variant,
  className,
}: GrowthPeriodBarChartProps) => {
  const config =
    variant === "escrows" ? escrowsChartConfig : combinedChartConfig;

  return (
    <ChartContainer
      className={cn("aspect-auto h-64 w-full md:h-72", className)}
      config={config}
    >
      <BarChart accessibilityLayer barGap={4} data={[...data]}>
        <XAxis
          axisLine={false}
          dataKey="period"
          tickFormatter={(value) =>
            formatPeriodKey(String(value), granularity, "short")
          }
          tickLine={false}
        />
        <YAxis axisLine={false} tickLine={false} width={40} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                formatPeriodKey(String(value), granularity, "full")
              }
            />
          }
        />
        {variant === "combined" ? (
          <ChartLegend content={<ChartLegendContent />} />
        ) : null}
        <Bar
          dataKey="escrows"
          fill="var(--color-escrows)"
          maxBarSize={variant === "combined" ? 28 : 40}
          radius={[4, 4, 0, 0]}
        />
        {variant === "combined" ? (
          <Bar
            dataKey="users"
            fill="var(--color-users)"
            maxBarSize={28}
            radius={[4, 4, 0, 0]}
          />
        ) : null}
      </BarChart>
    </ChartContainer>
  );
};

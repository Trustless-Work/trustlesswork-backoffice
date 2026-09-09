"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { PeriodGranularity } from "@/helpers/period-key.helper";
import { formatPeriodKey } from "@/helpers/period-key.helper";
import { cn } from "@/lib/utils";

export type ComparisonLinePoint = {
  period: string;
  escrows: number;
  users: number;
};

type GrowthComparisonLineChartProps = {
  data: readonly ComparisonLinePoint[];
  granularity: PeriodGranularity;
  className?: string;
};

const chartConfig = {
  escrows: {
    label: "Escrows",
    color: "var(--chart-1)",
  },
  users: {
    label: "Sign-ups",
    color: "var(--chart-3)",
  },
};

export const GrowthComparisonLineChart = ({
  data,
  granularity,
  className,
}: GrowthComparisonLineChartProps) => {
  return (
    <ChartContainer
      className={cn("aspect-auto h-64 w-full md:h-72", className)}
      config={chartConfig}
    >
      <LineChart accessibilityLayer data={[...data]}>
        <XAxis
          axisLine={false}
          dataKey="period"
          tickFormatter={(value) =>
            formatPeriodKey(String(value), granularity, "short")
          }
          tickLine={false}
        />
        <YAxis axisLine={false} tickLine={false} width={36} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                formatPeriodKey(String(value), granularity, "full")
              }
            />
          }
        />
        <Line
          dataKey="escrows"
          dot={false}
          stroke="var(--color-escrows)"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          dataKey="users"
          dot={false}
          stroke="var(--color-users)"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  );
};

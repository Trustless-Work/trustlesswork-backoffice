"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { PeriodGranularity } from "@/helpers/period-key.helper";
import { formatPeriodKey } from "@/helpers/period-key.helper";
import type { CategoryLinePoint } from "@/features/admin-analytics/utils/revenue.util";

type CategoryFeeLineChartProps = {
  data: readonly CategoryLinePoint[];
  granularity: PeriodGranularity;
};

const chartConfig = {
  released: {
    label: "Released fees",
    color: "var(--chart-1)",
  },
  resolved: {
    label: "Resolve fees",
    color: "var(--chart-4)",
  },
};

export const CategoryFeeLineChart = ({
  data,
  granularity,
}: CategoryFeeLineChartProps) => {
  const normalized = data.map((point) => ({
    period: point.period,
    released: Number(point.released),
    resolved: Number(point.resolved),
  }));

  return (
    <ChartContainer className="aspect-16/5 w-full" config={chartConfig}>
      <LineChart accessibilityLayer data={normalized}>
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
        <Line
          dataKey="released"
          dot={false}
          stroke="var(--color-released)"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          dataKey="resolved"
          dot={false}
          stroke="var(--color-resolved)"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  );
};

"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { NoData } from "@/components/shared/NoData";
import { PieChart as PieChartIcon } from "lucide-react";
import type { DonutSlice } from "@/features/admin-analytics/utils/revenue.util";

type DonutTooltipPayload = {
  value?: number;
  payload?: {
    label?: string;
    fill?: string;
  };
};

const DonutChartTooltipContent = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: readonly DonutTooltipPayload[];
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  const label = item.payload?.label;
  const value = item.value;
  const fill = item.payload?.fill;

  if (label == null || value == null) {
    return null;
  }

  return (
    <div className="grid min-w-36 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="flex w-full items-center gap-3">
        <div
          className="size-2.5 shrink-0 rounded-[2px]"
          style={{ backgroundColor: fill }}
        />
        <span className="text-muted-foreground">{label}</span>
        <span className="ml-auto pl-3 font-mono font-medium text-foreground tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : String(value)}
        </span>
      </div>
    </div>
  );
};

type DonutChartProps = {
  slices: readonly DonutSlice[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export const DonutChart = ({
  slices,
  emptyTitle = "No data",
  emptyDescription = "Nothing to chart in this range.",
  className = "aspect-square max-h-72 w-full",
}: DonutChartProps) => {
  if (slices.length === 0) {
    return (
      <NoData
        icon={PieChartIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const chartConfig = Object.fromEntries(
    slices.map((slice) => [
      slice.key,
      { label: slice.label, color: slice.color },
    ]),
  );

  const chartData = slices.map((slice) => ({
    key: slice.key,
    label: slice.label,
    value: Number(slice.value),
    fill: slice.color,
  }));

  return (
    <ChartContainer className={className} config={chartConfig}>
      <PieChart accessibilityLayer>
        <ChartTooltip content={<DonutChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
        <Pie
          data={chartData}
          dataKey="value"
          innerRadius="58%"
          nameKey="key"
          outerRadius="82%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};

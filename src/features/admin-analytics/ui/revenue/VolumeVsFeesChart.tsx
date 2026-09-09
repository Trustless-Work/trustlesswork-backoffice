"use client";

import { Bar, ComposedChart, Line, XAxis, YAxis } from "recharts";
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
import type { AnalyticsGranularity } from "@/features/admin-analytics/types/analytics.types";
import type { VolumeVsFeesResponse } from "@/features/admin-analytics/types/analytics-v2.types";
import {
  densifyVolumeVsFeesSeries,
  listVolumeVsFeesAssets,
  parseVolumeVsFeesAssetKey,
} from "@/features/admin-analytics/utils/volume-vs-fees.util";

type VolumeVsFeesChartProps = {
  data: VolumeVsFeesResponse;
  granularity: AnalyticsGranularity;
  assetKey: string;
};

const chartConfig = {
  createdVolume: {
    label: "Created volume",
    color: "var(--chart-1)",
  },
  releasedVolume: {
    label: "Released volume",
    color: "var(--chart-2)",
  },
  feeAmount: {
    label: "Fees",
    color: "var(--chart-4)",
  },
};

export const VolumeVsFeesChart = ({
  data,
  granularity,
  assetKey,
}: VolumeVsFeesChartProps) => {
  const { address } = parseVolumeVsFeesAssetKey(assetKey);
  const series = densifyVolumeVsFeesSeries(data, address, granularity);
  const normalized = series.map((point) => ({
    ...point,
    createdVolume: Number(point.createdVolume),
    releasedVolume: Number(point.releasedVolume),
    feeAmount: Number(point.feeAmount),
  }));

  if (normalized.length === 0) {
    return null;
  }

  const { symbol } = parseVolumeVsFeesAssetKey(assetKey);

  return (
    <DashboardCard className="gap-4">
      <DashboardCardTitle>Volume vs fees — {symbol}</DashboardCardTitle>
      <ChartContainer className="aspect-16/5 w-full" config={chartConfig}>
        <ComposedChart accessibilityLayer data={normalized}>
          <XAxis axisLine={false} dataKey="period" tickLine={false} />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={48}
            yAxisId="volume"
          />
          <YAxis
            axisLine={false}
            orientation="right"
            tickLine={false}
            width={48}
            yAxisId="fees"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="createdVolume"
            fill="var(--color-createdVolume)"
            radius={[2, 2, 0, 0]}
            yAxisId="volume"
          />
          <Bar
            dataKey="releasedVolume"
            fill="var(--color-releasedVolume)"
            radius={[2, 2, 0, 0]}
            yAxisId="volume"
          />
          <Line
            dataKey="feeAmount"
            dot={false}
            stroke="var(--color-feeAmount)"
            strokeWidth={2}
            type="monotone"
            yAxisId="fees"
          />
        </ComposedChart>
      </ChartContainer>
    </DashboardCard>
  );
};

export function getDefaultVolumeVsFeesAssetKey(
  data: VolumeVsFeesResponse,
): string | null {
  const assets = listVolumeVsFeesAssets(data);
  const usdc = assets.find((key) => key.startsWith("USDC|"));
  return usdc ?? assets[0] ?? null;
}

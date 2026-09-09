"use client";

import { cn } from "@/lib/utils";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import type { DashboardCreatedPoint } from "@/features/dashboard/types/dashboard.types";
import { formatDate, formatInteger } from "@/helpers/chart-format.helper";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Delta, DeltaIcon, DeltaValue } from "@/components/dashboard/delta";
import {
  DashboardCard,
  DashboardCardSeparator,
} from "@/components/dashboard/dashboard-card";
import { ordersChartConfig } from "@/features/dashboard/ui/orders-chart.data";
import {
  OrdersGradientBar,
  renderPeakLabel,
} from "@/features/dashboard/ui/orders-gradient-bar";

const PEAK_FALLBACK = "—";

type OrdersChartProps = {
  series: readonly DashboardCreatedPoint[];
  total: number;
  deltaPct: number;
  peakDate: string | null;
};

export function OrdersChart({
  series,
  total,
  deltaPct,
  peakDate,
}: OrdersChartProps) {
  const peakRow = series.find((row) => row.isPeak);
  const peakOrdersLabel = peakRow
    ? formatInteger(peakRow.orders)
    : PEAK_FALLBACK;
  const peakDateLabel = peakRow
    ? formatDate(peakRow.date, "day-month")
    : PEAK_FALLBACK;

  return (
    <DashboardCard className="gap-4">
      <div className="flex items-start justify-between gap-2 md:pe-2">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-2xl tabular-nums tracking-tight">
            {formatInteger(total)}
          </span>
          <span className="text-pretty text-muted-foreground text-xs">
            Escrows created in the last 30 days
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex w-fit items-center gap-1 text-muted-foreground text-xs">
            <span>Peak</span>
            <span className="font-medium text-foreground tabular-nums">
              {peakOrdersLabel}
            </span>
            <span>on</span>
            <span className="font-medium text-foreground">{peakDateLabel}</span>
          </span>
          <DashboardCardSeparator />
          <div className="inline-flex items-center gap-1 text-xs">
            <Delta value={deltaPct}>
              <DeltaIcon filled variant="arrow" />
              <DeltaValue />
            </Delta>
            <span className="text-muted-foreground">over last 30 days</span>
          </div>
        </div>
      </div>
      <ChartContainer
        className={cn("aspect-16/5 w-full")}
        config={ordersChartConfig}
      >
        <BarChart
          accessibilityLayer
          data={[...series]}
          margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
        >
          <XAxis
            axisLine={false}
            dataKey="date"
            interval={4}
            tickFormatter={(value) => formatDate(String(value), "day-month")}
            tickLine={false}
            type="category"
          />
          <YAxis axisLine={false} tickLine={false} tickMargin={8} width={36} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Bar
            dataKey="orders"
            fill="var(--color-orders)"
            name={ordersChartConfig.orders.label}
            shape={(props) => (
              <OrdersGradientBar
                fill={props.fill}
                height={props.height}
                index={props.index}
                payload={props.payload}
                peakDate={peakDate ?? ""}
                width={props.width}
                x={props.x}
                y={props.y}
              />
            )}
          >
            <LabelList content={renderPeakLabel} dataKey="orders" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </DashboardCard>
  );
}

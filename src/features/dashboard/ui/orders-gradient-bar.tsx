import type { ChartConfig } from "@/components/ui/chart";
import { ordersChartConfig } from "@/features/dashboard/ui/orders-chart.data";
import { formatDate } from "@/helpers/chart-format.helper";

/** Horizontal overlap hides band-scale rounding + SVG antialiasing hairlines between neighbours. */
const BAR_BLEED_X = 0.75;
const BAR_FILL_GRAD_TOP_OPACITY = 0.45;
const BAR_FILL_GRAD_BOTTOM_OPACITY = 0.0;
const BAR_STROKE_FILL_OPACITY = 1;

type OrdersGradientBarProps = {
  fill?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: { date?: string };
  peakDate: string;
};

const chartConfig = ordersChartConfig satisfies ChartConfig;

/** Gradient bar + top stroke cap (same pattern as `dashboard/8/peak-hours.tsx`); peak day uses solid foreground. */
export function OrdersGradientBar({
  fill,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  index = 0,
  peakDate,
}: OrdersGradientBarProps) {
  const date = payload?.date ?? "";
  const isPeak = date === peakDate;
  const capColor = isPeak
    ? chartConfig.orders.color
    : (fill ?? chartConfig.orders.color);
  const gid = `orders-gradient-bar-${index}-${date}`;
  const strokeGid = `${gid}-stroke`;
  const bleed = BAR_BLEED_X;
  const bx = typeof x === "number" ? x - bleed / 2 : x;
  const bw = typeof width === "number" ? width + bleed : width;

  if (isPeak) {
    return (
      <rect
        fill={capColor}
        height={height}
        rx={4}
        ry={5}
        width={bw}
        x={bx}
        y={y}
      />
    );
  }

  return (
    <>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor={capColor}
            stopOpacity={BAR_FILL_GRAD_TOP_OPACITY}
          />
          <stop
            offset="100%"
            stopColor={capColor}
            stopOpacity={BAR_FILL_GRAD_BOTTOM_OPACITY}
          />
        </linearGradient>
        <linearGradient id={strokeGid} x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor={capColor}
            stopOpacity={BAR_STROKE_FILL_OPACITY}
          />
          <stop
            offset="100%"
            stopColor={capColor}
            stopOpacity={BAR_FILL_GRAD_BOTTOM_OPACITY}
          />
        </linearGradient>
      </defs>
      <rect
        fill={`url(#${gid})`}
        height={height}
        rx={4}
        ry={5}
        stroke={`url(#${strokeGid})`}
        strokeWidth={0.5}
        width={bw}
        x={bx}
        y={y}
      />
    </>
  );
}

export function renderPeakLabel({
  x,
  y,
  width,
  payload,
}: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  payload?: { date?: string; isPeak?: boolean };
}) {
  if (
    !(
      payload?.isPeak &&
      typeof payload.date === "string" &&
      typeof x === "number" &&
      typeof y === "number" &&
      typeof width === "number"
    )
  ) {
    return null;
  }
  return (
    <text
      className="fill-foreground text-[11px] tabular-nums"
      textAnchor="middle"
      x={x + width / 2}
      y={y - 8}
    >
      {formatDate(payload.date, "day-month")}
    </text>
  );
}

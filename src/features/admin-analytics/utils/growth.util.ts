import type { SeriesGrowthPoint } from "@/features/admin-analytics/types/analytics.types";

export function getSeriesPointPeriod(point: SeriesGrowthPoint): string {
  return point.period;
}

export function sumSeriesCounts(points: readonly SeriesGrowthPoint[]): number {
  return points.reduce((total, point) => total + point.count, 0);
}

/** @deprecated Use sumSeriesCounts */
export const sumMonthlyCounts = sumSeriesCounts;

export function latestGrowthPct(
  points: readonly SeriesGrowthPoint[],
): number | null {
  if (points.length === 0) {
    return null;
  }
  return points[points.length - 1]?.growthPct ?? null;
}

export function toAreaChartSeries(points: readonly SeriesGrowthPoint[]) {
  return points.map((point) => ({
    date: getSeriesPointPeriod(point),
    volume: point.count,
  }));
}

export function toBarChartSeries(points: readonly SeriesGrowthPoint[]) {
  return points.map((point) => ({
    date: getSeriesPointPeriod(point),
    count: point.count,
    isPeak: false,
  }));
}

export function toComparisonLineSeries(
  escrowPoints: readonly SeriesGrowthPoint[],
  userPoints: readonly SeriesGrowthPoint[],
) {
  const userByPeriod = new Map(
    userPoints.map((point) => [getSeriesPointPeriod(point), point.count]),
  );

  return escrowPoints.map((point) => {
    const period = getSeriesPointPeriod(point);
    return {
      period,
      escrows: point.count,
      users: userByPeriod.get(period) ?? 0,
    };
  });
}

export function peakSeriesPoint(points: readonly SeriesGrowthPoint[]) {
  if (points.length === 0) {
    return null;
  }
  return points.reduce((peak, point) =>
    point.count > peak.count ? point : peak,
  );
}

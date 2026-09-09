import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import type { AnalyticsGranularity } from "@/features/admin-analytics/types/analytics.types";

export type UtcRangeBounds = {
  readonly from: string;
  readonly to: string;
};

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfUtcWeek(date: Date): Date {
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + diff);
  return startOfUtcDay(monday);
}

function shiftUtcMonths(date: Date, delta: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1),
  );
}

function shiftUtcDays(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + delta);
  return next;
}

/** Inclusive UTC bounds aligned to the selected analytics range. */
export function getUtcRangeBounds(range: AnalyticsRange): UtcRangeBounds {
  const now = new Date();
  const to = now.toISOString();

  if (range.granularity === "month") {
    const start = shiftUtcMonths(startOfUtcMonth(now), -(range.periods - 1));
    return { from: start.toISOString(), to };
  }

  if (range.granularity === "week") {
    const start = shiftUtcDays(
      startOfUtcWeek(now),
      -7 * (range.periods - 1),
    );
    return { from: start.toISOString(), to };
  }

  const start = shiftUtcDays(startOfUtcDay(now), -(range.periods - 1));
  return { from: start.toISOString(), to };
}

export function resolveResponseGranularity(
  responseGranularity: AnalyticsGranularity | undefined,
  fallback: AnalyticsGranularity,
): AnalyticsGranularity {
  return responseGranularity ?? fallback;
}

export function seriesParams(range: AnalyticsRange): Record<string, string | number> {
  return {
    granularity: range.granularity,
    periods: range.periods,
  };
}

export function rangeParams(range: AnalyticsRange): UtcRangeBounds {
  return getUtcRangeBounds(range);
}

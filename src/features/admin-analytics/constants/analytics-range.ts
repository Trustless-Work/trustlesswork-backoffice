export type AnalyticsGranularity = "day" | "week" | "month";

export type AnalyticsRange = {
  readonly granularity: AnalyticsGranularity;
  readonly periods: number;
};

export type AnalyticsRangePresetId =
  | "12m"
  | "30d"
  | "7d"
  | "3d"
  | "1d"
  | "12w";

export type AnalyticsRangePreset = {
  readonly id: AnalyticsRangePresetId;
  readonly label: string;
  readonly granularity: AnalyticsGranularity;
  readonly periods: number;
};

export const ANALYTICS_RANGE_PRESETS: readonly AnalyticsRangePreset[] = [
  { id: "12m", label: "Last 12 months", granularity: "month", periods: 12 },
  { id: "30d", label: "Last 30 days", granularity: "day", periods: 30 },
  { id: "7d", label: "Last 7 days", granularity: "day", periods: 7 },
  { id: "3d", label: "Last 3 days", granularity: "day", periods: 3 },
  { id: "1d", label: "Last day", granularity: "day", periods: 1 },
  { id: "12w", label: "Weekly (12 wks)", granularity: "week", periods: 12 },
] as const;

export const DEFAULT_ANALYTICS_RANGE: AnalyticsRange = {
  granularity: "month",
  periods: 12,
};

export const DEFAULT_ANALYTICS_RANGE_PRESET_ID: AnalyticsRangePresetId = "12m";

export function isAnalyticsRangePresetId(
  value: string,
): value is AnalyticsRangePresetId {
  return ANALYTICS_RANGE_PRESETS.some((preset) => preset.id === value);
}

export function findRangePreset(
  range: AnalyticsRange,
): AnalyticsRangePreset | undefined {
  return ANALYTICS_RANGE_PRESETS.find(
    (preset) =>
      preset.granularity === range.granularity &&
      preset.periods === range.periods,
  );
}

export function rangeQueryKey(range: AnalyticsRange): string {
  return `${range.granularity}:${range.periods}`;
}

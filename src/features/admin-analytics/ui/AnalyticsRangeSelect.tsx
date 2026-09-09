"use client";

import {
  ANALYTICS_RANGE_PRESETS,
  DEFAULT_ANALYTICS_RANGE_PRESET_ID,
  isAnalyticsRangePresetId,
  type AnalyticsRange,
  type AnalyticsRangePresetId,
} from "@/features/admin-analytics/constants/analytics-range";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AnalyticsRangeSelectProps = {
  value: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
};

function resolvePresetId(range: AnalyticsRange): AnalyticsRangePresetId {
  const match = ANALYTICS_RANGE_PRESETS.find(
    (preset) =>
      preset.granularity === range.granularity &&
      preset.periods === range.periods,
  );
  return match?.id ?? DEFAULT_ANALYTICS_RANGE_PRESET_ID;
}

export const AnalyticsRangeSelect = ({
  value,
  onChange,
}: AnalyticsRangeSelectProps) => {
  const selectedId = resolvePresetId(value);

  return (
    <Select
      value={selectedId}
      onValueChange={(next) => {
        if (!isAnalyticsRangePresetId(next)) {
          return;
        }
        const preset = ANALYTICS_RANGE_PRESETS.find((item) => item.id === next);
        if (!preset) {
          return;
        }
        onChange({
          granularity: preset.granularity,
          periods: preset.periods,
        });
      }}
    >
      <SelectTrigger className="h-8 w-full rounded-lg sm:w-[168px]">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        {ANALYTICS_RANGE_PRESETS.map((preset) => (
          <SelectItem key={preset.id} value={preset.id}>
            {preset.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

"use client";

import { API_KEYS_TOP_BY_OPTIONS } from "@/features/admin-analytics/constants/analytics-filters";
import type { ApiKeysTopBy } from "@/features/admin-analytics/types/analytics-v2.types";
import { AnalyticsFilterField } from "@/features/admin-analytics/ui/filters/AnalyticsFilterField";
import { AnalyticsFilterOptions } from "@/features/admin-analytics/ui/filters/AnalyticsFilterOptions";
import { AnalyticsFilterPopover } from "@/features/admin-analytics/ui/filters/AnalyticsFilterPopover";

const DEFAULT_API_KEYS_TOP_BY: ApiKeysTopBy = "revenue";

type ApiKeysFiltersPopoverProps = {
  topBy: ApiKeysTopBy;
  onTopByChange: (topBy: ApiKeysTopBy) => void;
};

export const ApiKeysFiltersPopover = ({
  topBy,
  onTopByChange,
}: ApiKeysFiltersPopoverProps) => (
  <AnalyticsFilterPopover
    activeCount={topBy === DEFAULT_API_KEYS_TOP_BY ? 0 : 1}
    onClear={() => onTopByChange(DEFAULT_API_KEYS_TOP_BY)}
  >
    <AnalyticsFilterField label="Top keys ranked by">
      <AnalyticsFilterOptions
        columns={2}
        options={API_KEYS_TOP_BY_OPTIONS}
        value={topBy}
        onChange={onTopByChange}
      />
    </AnalyticsFilterField>
  </AnalyticsFilterPopover>
);

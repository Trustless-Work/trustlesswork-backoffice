"use client";

import { ESCROWS_TOP_BY_OPTIONS } from "@/features/admin-analytics/constants/analytics-filters";
import type { EscrowsTopBy } from "@/features/admin-analytics/types/analytics-v2.types";
import { AnalyticsFilterField } from "@/features/admin-analytics/ui/filters/AnalyticsFilterField";
import { AnalyticsFilterOptions } from "@/features/admin-analytics/ui/filters/AnalyticsFilterOptions";
import { AnalyticsFilterPopover } from "@/features/admin-analytics/ui/filters/AnalyticsFilterPopover";

const DEFAULT_ESCROWS_TOP_BY: EscrowsTopBy = "amount";

type EscrowsFiltersPopoverProps = {
  topBy: EscrowsTopBy;
  onTopByChange: (topBy: EscrowsTopBy) => void;
};

export const EscrowsFiltersPopover = ({
  topBy,
  onTopByChange,
}: EscrowsFiltersPopoverProps) => (
  <AnalyticsFilterPopover
    activeCount={topBy === DEFAULT_ESCROWS_TOP_BY ? 0 : 1}
    onClear={() => onTopByChange(DEFAULT_ESCROWS_TOP_BY)}
  >
    <AnalyticsFilterField label="Top escrows ranked">
      <AnalyticsFilterOptions
        columns={2}
        options={ESCROWS_TOP_BY_OPTIONS}
        value={topBy}
        onChange={onTopByChange}
      />
    </AnalyticsFilterField>
  </AnalyticsFilterPopover>
);

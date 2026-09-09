"use client";

import { useMemo } from "react";
import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import {
  ALL_ASSETS_VALUE,
  ALL_EVENT_TYPES_VALUE,
  REVENUE_EVENT_TYPE_OPTIONS,
  REVENUE_ORDER_OPTIONS,
  REVENUE_SORT_OPTIONS,
} from "@/features/admin-analytics/constants/analytics-filters";
import { useRevenueByToken } from "@/features/admin-analytics/hooks/useAdminAnalytics";
import type {
  AnalyticsFilterOption,
  RevenueFiltersController,
} from "@/features/admin-analytics/types/analytics-filters.types";
import { AnalyticsFilterField } from "@/features/admin-analytics/ui/filters/AnalyticsFilterField";
import { AnalyticsFilterOptions } from "@/features/admin-analytics/ui/filters/AnalyticsFilterOptions";
import { AnalyticsFilterPopover } from "@/features/admin-analytics/ui/filters/AnalyticsFilterPopover";
import { AnalyticsSearchInput } from "@/features/admin-analytics/ui/filters/AnalyticsSearchInput";
import { resolveAssetSymbol } from "@/features/admin-analytics/utils/revenue.util";

type RevenueFiltersPopoverProps = {
  range: AnalyticsRange;
  controller: RevenueFiltersController;
};

export const RevenueFiltersPopover = ({
  range,
  controller,
}: RevenueFiltersPopoverProps) => {
  const query = useRevenueByToken(range);
  const { filters } = controller;

  const assetOptions = useMemo<readonly AnalyticsFilterOption<string>[]>(() => {
    const buckets = query.data?.data ?? [];
    const uniqueAssets = [
      ...new Map(buckets.map((bucket) => [bucket.asset.address, bucket.asset])),
    ].map(([, asset]) => asset);

    return [
      { value: ALL_ASSETS_VALUE, label: "All assets" },
      ...uniqueAssets.map((asset) => ({
        value: asset.address,
        label: `${resolveAssetSymbol(asset)}${asset.resolved ? "" : " *"}`,
      })),
    ];
  }, [query.data?.data]);

  return (
    <AnalyticsFilterPopover
      activeCount={controller.activeFilterCount}
      onClear={controller.resetFilters}
    >
      <AnalyticsFilterField label="Organization">
        <AnalyticsSearchInput
          placeholder="Search organization"
          value={filters.search}
          onChange={controller.setSearch}
        />
      </AnalyticsFilterField>

      <AnalyticsFilterField label="Asset">
        <AnalyticsFilterOptions
          className="max-h-40 overflow-y-auto p-px"
          columns={2}
          options={assetOptions}
          value={filters.asset}
          onChange={controller.setAsset}
        />
      </AnalyticsFilterField>

      <AnalyticsFilterField label="Event type">
        <AnalyticsFilterOptions
          options={REVENUE_EVENT_TYPE_OPTIONS}
          value={filters.eventType ?? ALL_EVENT_TYPES_VALUE}
          onChange={(next) =>
            controller.setEventType(
              next === ALL_EVENT_TYPES_VALUE ? undefined : next,
            )
          }
        />
      </AnalyticsFilterField>

      <AnalyticsFilterField label="Sort by">
        <AnalyticsFilterOptions
          columns={2}
          options={REVENUE_SORT_OPTIONS}
          value={filters.sort}
          onChange={controller.setSort}
        />
      </AnalyticsFilterField>

      <AnalyticsFilterField label="Order">
        <AnalyticsFilterOptions
          columns={2}
          options={REVENUE_ORDER_OPTIONS}
          value={filters.order}
          onChange={controller.setOrder}
        />
      </AnalyticsFilterField>
    </AnalyticsFilterPopover>
  );
};

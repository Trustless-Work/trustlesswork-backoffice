"use client";

import { useCallback, useMemo, useState } from "react";
import { DEFAULT_REVENUE_ASSET_ADDRESS } from "@/features/admin-analytics/constants/analytics-filters";
import type {
  RevenueFilters,
  RevenueFiltersController,
} from "@/features/admin-analytics/types/analytics-filters.types";
import type {
  RevenueEventOrder,
  RevenueEventSort,
  RevenueEventType,
} from "@/features/admin-analytics/types/analytics.types";

const DEFAULT_REVENUE_FILTERS: RevenueFilters = {
  asset: DEFAULT_REVENUE_ASSET_ADDRESS,
  eventType: undefined,
  sort: "timestamp",
  order: "desc",
  search: "",
};

export function useRevenueFilters(): RevenueFiltersController {
  const [filters, setFilters] = useState<RevenueFilters>(
    DEFAULT_REVENUE_FILTERS,
  );

  const setAsset = useCallback((asset: string) => {
    setFilters((current) => ({ ...current, asset }));
  }, []);

  const setEventType = useCallback((eventType?: RevenueEventType) => {
    setFilters((current) => ({ ...current, eventType }));
  }, []);

  const setSort = useCallback((sort: RevenueEventSort) => {
    setFilters((current) => ({ ...current, sort }));
  }, []);

  const setOrder = useCallback((order: RevenueEventOrder) => {
    setFilters((current) => ({ ...current, order }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((current) =>
      current.search === search ? current : { ...current, search },
    );
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_REVENUE_FILTERS);
  }, []);

  const activeFilterCount = useMemo(() => {
    const deviations = [
      filters.asset !== DEFAULT_REVENUE_FILTERS.asset,
      Boolean(filters.eventType),
      filters.sort !== DEFAULT_REVENUE_FILTERS.sort,
      filters.order !== DEFAULT_REVENUE_FILTERS.order,
      filters.search.length > 0,
    ];

    return deviations.filter(Boolean).length;
  }, [filters]);

  return {
    filters,
    activeFilterCount,
    setAsset,
    setEventType,
    setSort,
    setOrder,
    setSearch,
    resetFilters,
  };
}

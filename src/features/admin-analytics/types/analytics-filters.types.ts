import type {
  RevenueEventOrder,
  RevenueEventSort,
  RevenueEventType,
} from "@/features/admin-analytics/types/analytics.types";

export type AnalyticsFilterOption<TValue extends string> = {
  readonly value: TValue;
  readonly label: string;
};

export type RevenueFilters = {
  readonly asset: string;
  readonly eventType?: RevenueEventType;
  readonly sort: RevenueEventSort;
  readonly order: RevenueEventOrder;
  readonly search: string;
};

export type RevenueFiltersController = {
  readonly filters: RevenueFilters;
  readonly activeFilterCount: number;
  readonly setAsset: (asset: string) => void;
  readonly setEventType: (eventType?: RevenueEventType) => void;
  readonly setSort: (sort: RevenueEventSort) => void;
  readonly setOrder: (order: RevenueEventOrder) => void;
  readonly setSearch: (search: string) => void;
  readonly resetFilters: () => void;
};

import type {
  ApiKeysTopBy,
  EscrowsTopBy,
} from "@/features/admin-analytics/types/analytics-v2.types";
import type { AnalyticsFilterOption } from "@/features/admin-analytics/types/analytics-filters.types";
import type {
  RevenueEventOrder,
  RevenueEventSort,
  RevenueEventType,
} from "@/features/admin-analytics/types/analytics.types";

export const ALL_ASSETS_VALUE = "__all__";
export const ALL_EVENT_TYPES_VALUE = "all";

export const DEFAULT_REVENUE_ASSET_ADDRESS =
  "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

export type RevenueEventTypeFilterValue =
  | RevenueEventType
  | typeof ALL_EVENT_TYPES_VALUE;

export const REVENUE_EVENT_TYPE_OPTIONS: readonly AnalyticsFilterOption<RevenueEventTypeFilterValue>[] =
  [
    { value: ALL_EVENT_TYPES_VALUE, label: "All events" },
    { value: "release", label: "Release" },
    { value: "resolve_dispute", label: "Resolve" },
  ];

export const REVENUE_SORT_OPTIONS: readonly AnalyticsFilterOption<RevenueEventSort>[] =
  [
    { value: "timestamp", label: "Timestamp" },
    { value: "amount", label: "Released" },
  ];

export const REVENUE_ORDER_OPTIONS: readonly AnalyticsFilterOption<RevenueEventOrder>[] =
  [
    { value: "desc", label: "Newest first" },
    { value: "asc", label: "Oldest first" },
  ];

export const ESCROWS_TOP_BY_OPTIONS: readonly AnalyticsFilterOption<EscrowsTopBy>[] =
  [
    { value: "amount", label: "By amount" },
    { value: "fee", label: "By fee" },
  ];

export const API_KEYS_TOP_BY_OPTIONS: readonly AnalyticsFilterOption<ApiKeysTopBy>[] =
  [
    { value: "revenue", label: "Revenue" },
    { value: "volume", label: "Volume" },
    { value: "escrows", label: "Escrows" },
    { value: "requests", label: "Requests" },
  ];

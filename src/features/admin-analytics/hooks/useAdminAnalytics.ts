import { useQuery } from "@tanstack/react-query";
import { getStoredNetwork } from "@/lib/client-storage";
import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import { rangeQueryKey } from "@/features/admin-analytics/constants/analytics-range";
import {
  adminAnalyticsService,
} from "@/features/admin-analytics/services/admin-analytics.service";
import type {
  ApiKeysTopBy,
  EscrowsTopBy,
} from "@/features/admin-analytics/types/analytics-v2.types";
import type { RevenueEventsQuery } from "@/features/admin-analytics/types/analytics.types";
import {
  ADMIN_ANALYTICS_REFETCH_INTERVAL,
  ADMIN_ANALYTICS_STALE_TIME,
  adminAnalyticsQueryKey,
  getAdminAnalyticsErrorMessage,
  shouldRetryAdminAnalytics,
} from "@/features/admin-analytics/utils/analytics-query.util";

const sharedQueryOptions = {
  staleTime: ADMIN_ANALYTICS_STALE_TIME,
  refetchInterval: ADMIN_ANALYTICS_REFETCH_INTERVAL,
  retry: shouldRetryAdminAnalytics,
} as const;

function networkQueryKey(): string {
  return getStoredNetwork();
}

export function useEscrowGrowth(range: AnalyticsRange) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "escrows-monthly",
      networkQueryKey(),
      rangeQueryKey(range),
    ),
    queryFn: () => adminAnalyticsService.getEscrowGrowth(range),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useUserGrowth(range: AnalyticsRange) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "users-monthly",
      networkQueryKey(),
      rangeQueryKey(range),
    ),
    queryFn: () => adminAnalyticsService.getUserGrowth(range),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useRevenueByToken(range: AnalyticsRange) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "revenue-monthly",
      networkQueryKey(),
      rangeQueryKey(range),
    ),
    queryFn: () => adminAnalyticsService.getRevenueByToken(range),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useRevenueEvents(
  range: AnalyticsRange,
  query: RevenueEventsQuery,
) {
  const eventsQuery = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "revenue-events",
      networkQueryKey(),
      rangeQueryKey(range),
      query.limit,
      query.offset,
      query.eventType ?? "all",
      query.sort ?? "timestamp",
      query.order ?? "desc",
      query.search ?? "",
      query.asset ?? "all",
    ),
    queryFn: () => adminAnalyticsService.getRevenueEvents(range, query),
    ...sharedQueryOptions,
  });

  return {
    ...eventsQuery,
    errorMessage: eventsQuery.error
      ? getAdminAnalyticsErrorMessage(eventsQuery.error)
      : null,
  };
}

export function useStatusFunnel(range: AnalyticsRange) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "escrows-status",
      networkQueryKey(),
      rangeQueryKey(range),
    ),
    queryFn: () => adminAnalyticsService.getStatusFunnel(range),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useEscrowsTop(
  range: AnalyticsRange,
  by: EscrowsTopBy,
  limit = 10,
) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "escrows-top",
      networkQueryKey(),
      rangeQueryKey(range),
      by,
      limit,
    ),
    queryFn: () => adminAnalyticsService.getEscrowsTop(range, by, limit),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useEscrowConversion(range: AnalyticsRange) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "escrows-conversion",
      networkQueryKey(),
      rangeQueryKey(range),
    ),
    queryFn: () => adminAnalyticsService.getEscrowConversion(range),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useEscrowAverages(range: AnalyticsRange) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "escrows-averages",
      networkQueryKey(),
      rangeQueryKey(range),
    ),
    queryFn: () => adminAnalyticsService.getEscrowAverages(range),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useVolumeVsFees(range: AnalyticsRange) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "volume-vs-fees",
      networkQueryKey(),
      rangeQueryKey(range),
    ),
    queryFn: () => adminAnalyticsService.getVolumeVsFees(range),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useApiKeysSummary(range: AnalyticsRange) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "api-keys-summary",
      networkQueryKey(),
      rangeQueryKey(range),
    ),
    queryFn: () => adminAnalyticsService.getApiKeysSummary(range),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useApiKeysTop(
  range: AnalyticsRange,
  by: ApiKeysTopBy,
  limit = 10,
) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "api-keys-top",
      networkQueryKey(),
      rangeQueryKey(range),
      by,
      limit,
    ),
    queryFn: () => adminAnalyticsService.getApiKeysTop(range, by, limit),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useApiKeyDetail(
  range: AnalyticsRange,
  keyId: string | null,
) {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey(
      "api-key-detail",
      networkQueryKey(),
      rangeQueryKey(range),
      keyId ?? "none",
    ),
    queryFn: () => {
      if (!keyId) {
        throw new Error("keyId is required");
      }
      return adminAnalyticsService.getApiKeyDetail(range, keyId);
    },
    enabled: Boolean(keyId),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

export function useDataQuality() {
  const query = useQuery({
    queryKey: adminAnalyticsQueryKey("data-quality", networkQueryKey()),
    queryFn: () => adminAnalyticsService.getDataQuality(),
    ...sharedQueryOptions,
  });

  return {
    ...query,
    errorMessage: query.error
      ? getAdminAnalyticsErrorMessage(query.error)
      : null,
  };
}

import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import { rangeQueryKey } from "@/features/admin-analytics/constants/analytics-range";
import {
  getUtcRangeBounds,
  rangeParams,
  seriesParams,
} from "@/features/admin-analytics/utils/analytics-range.util";
import adminHttp from "@/lib/admin-http";
import {
  apiKeyDetailResponseSchema,
  apiKeysSummaryResponseSchema,
  apiKeysTopResponseSchema,
  escrowAveragesResponseSchema,
  escrowConversionResponseSchema,
  escrowsTopResponseSchema,
  volumeVsFeesResponseSchema,
} from "@/features/admin-analytics/schemas/analytics-v2.schema";
import {
  dataQualityResponseSchema,
  escrowGrowthResponseSchema,
  revenueByTokenResponseSchema,
  revenueEventsResponseSchema,
  statusFunnelResponseSchema,
  userGrowthResponseSchema,
} from "@/features/admin-analytics/schemas/analytics.schema";
import type {
  ApiKeyDetailResponse,
  ApiKeysSummaryResponse,
  ApiKeysTopBy,
  ApiKeysTopResponse,
  EscrowAveragesResponse,
  EscrowConversionResponse,
  EscrowsTopBy,
  EscrowsTopResponse,
  VolumeVsFeesResponse,
} from "@/features/admin-analytics/types/analytics-v2.types";
import type {
  DataQualityResponse,
  EscrowGrowthResponse,
  RevenueByTokenResponse,
  RevenueEventsQuery,
  RevenueEventsResponse,
  StatusFunnelResponse,
  UserGrowthResponse,
} from "@/features/admin-analytics/types/analytics.types";

const ANALYTICS_BASE = "/admin/analytics";

export const adminAnalyticsService = {
  async getEscrowGrowth(range: AnalyticsRange): Promise<EscrowGrowthResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/escrows/monthly`,
      { params: seriesParams(range) },
    );
    return escrowGrowthResponseSchema.parse(data);
  },

  async getUserGrowth(range: AnalyticsRange): Promise<UserGrowthResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/users/monthly`,
      { params: seriesParams(range) },
    );
    return userGrowthResponseSchema.parse(data);
  },

  async getRevenueByToken(
    range: AnalyticsRange,
  ): Promise<RevenueByTokenResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/revenue/monthly`,
      { params: seriesParams(range) },
    );
    return revenueByTokenResponseSchema.parse(data);
  },

  async getRevenueEvents(
    range: AnalyticsRange,
    query: RevenueEventsQuery,
  ): Promise<RevenueEventsResponse> {
    const bounds = getUtcRangeBounds(range);
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/revenue/events`,
      {
        params: {
          limit: query.limit,
          offset: query.offset,
          from: query.from ?? bounds.from,
          to: query.to ?? bounds.to,
          ...(query.eventType ? { eventType: query.eventType } : {}),
          ...(query.sort ? { sort: query.sort } : {}),
          ...(query.order ? { order: query.order } : {}),
          ...(query.search ? { search: query.search } : {}),
          ...(query.asset ? { asset: query.asset } : {}),
        },
      },
    );
    return revenueEventsResponseSchema.parse(data);
  },

  async getStatusFunnel(range: AnalyticsRange): Promise<StatusFunnelResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/escrows/status`,
      { params: rangeParams(range) },
    );
    return statusFunnelResponseSchema.parse(data);
  },

  async getEscrowsTop(
    range: AnalyticsRange,
    by: EscrowsTopBy,
    limit = 10,
  ): Promise<EscrowsTopResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/escrows/top`,
      { params: { ...rangeParams(range), by, limit } },
    );
    return escrowsTopResponseSchema.parse(data);
  },

  async getEscrowConversion(
    range: AnalyticsRange,
  ): Promise<EscrowConversionResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/escrows/conversion`,
      { params: seriesParams(range) },
    );
    return escrowConversionResponseSchema.parse(data);
  },

  async getEscrowAverages(
    range: AnalyticsRange,
  ): Promise<EscrowAveragesResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/escrows/averages`,
      { params: rangeParams(range) },
    );
    return escrowAveragesResponseSchema.parse(data);
  },

  async getVolumeVsFees(range: AnalyticsRange): Promise<VolumeVsFeesResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/volume-vs-fees`,
      { params: seriesParams(range) },
    );
    return volumeVsFeesResponseSchema.parse(data);
  },

  async getApiKeysSummary(
    range: AnalyticsRange,
  ): Promise<ApiKeysSummaryResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/api-keys/summary`,
      { params: rangeParams(range) },
    );
    return apiKeysSummaryResponseSchema.parse(data);
  },

  async getApiKeysTop(
    range: AnalyticsRange,
    by: ApiKeysTopBy,
    limit = 10,
  ): Promise<ApiKeysTopResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/api-keys/top`,
      { params: { ...rangeParams(range), by, limit } },
    );
    return apiKeysTopResponseSchema.parse(data);
  },

  async getApiKeyDetail(
    range: AnalyticsRange,
    keyId: string,
  ): Promise<ApiKeyDetailResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/api-keys/${encodeURIComponent(keyId)}`,
      { params: rangeParams(range) },
    );
    return apiKeyDetailResponseSchema.parse(data);
  },

  async getDataQuality(): Promise<DataQualityResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/data-quality`,
    );
    return dataQualityResponseSchema.parse(data);
  },
};

export { rangeQueryKey };

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
import type { ContractVersionFilter } from "@/types";

const ANALYTICS_BASE = "/admin/analytics";

function withContractVersion<T extends object>(
  params: T,
  contractVersion: ContractVersionFilter,
): T & { contractVersion: ContractVersionFilter } {
  return {
    ...params,
    contractVersion,
  };
}

export const adminAnalyticsService = {
  async getEscrowGrowth(
    range: AnalyticsRange,
    contractVersion: ContractVersionFilter = "all",
  ): Promise<EscrowGrowthResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/escrows/monthly`,
      { params: withContractVersion(seriesParams(range), contractVersion) },
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
    contractVersion: ContractVersionFilter = "all",
  ): Promise<RevenueByTokenResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/revenue/monthly`,
      { params: withContractVersion(seriesParams(range), contractVersion) },
    );
    return revenueByTokenResponseSchema.parse(data);
  },

  async getRevenueEvents(
    range: AnalyticsRange,
    query: RevenueEventsQuery,
    contractVersion: ContractVersionFilter = "all",
  ): Promise<RevenueEventsResponse> {
    const bounds = getUtcRangeBounds(range);
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/revenue/events`,
      {
        params: withContractVersion(
          {
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
          contractVersion,
        ),
      },
    );
    return revenueEventsResponseSchema.parse(data);
  },

  async getStatusFunnel(
    range: AnalyticsRange,
    contractVersion: ContractVersionFilter = "all",
  ): Promise<StatusFunnelResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/escrows/status`,
      { params: withContractVersion(rangeParams(range), contractVersion) },
    );
    return statusFunnelResponseSchema.parse(data);
  },

  async getEscrowsTop(
    range: AnalyticsRange,
    by: EscrowsTopBy,
    limit = 10,
    contractVersion: ContractVersionFilter = "all",
  ): Promise<EscrowsTopResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/escrows/top`,
      {
        params: withContractVersion(
          { ...rangeParams(range), by, limit },
          contractVersion,
        ),
      },
    );
    return escrowsTopResponseSchema.parse(data);
  },

  async getEscrowConversion(
    range: AnalyticsRange,
    contractVersion: ContractVersionFilter = "all",
  ): Promise<EscrowConversionResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/escrows/conversion`,
      { params: withContractVersion(seriesParams(range), contractVersion) },
    );
    return escrowConversionResponseSchema.parse(data);
  },

  async getEscrowAverages(
    range: AnalyticsRange,
    contractVersion: ContractVersionFilter = "all",
  ): Promise<EscrowAveragesResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/escrows/averages`,
      { params: withContractVersion(rangeParams(range), contractVersion) },
    );
    return escrowAveragesResponseSchema.parse(data);
  },

  async getVolumeVsFees(
    range: AnalyticsRange,
    contractVersion: ContractVersionFilter = "all",
  ): Promise<VolumeVsFeesResponse> {
    const { data } = await adminHttp.get<unknown>(
      `${ANALYTICS_BASE}/volume-vs-fees`,
      { params: withContractVersion(seriesParams(range), contractVersion) },
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

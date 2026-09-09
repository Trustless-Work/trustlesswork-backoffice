import type { z } from "zod/v3";
import type {
  analyticsEscrowTypeSchema,
  analyticsGranularitySchema,
  dataQualityResponseSchema,
  escrowGrowthResponseSchema,
  revenueAssetSchema,
  revenueBucketSchema,
  revenueByTokenResponseSchema,
  revenueEventSchema,
  revenueEventsResponseSchema,
  revenueEventTypeSchema,
  topOrganizationAssetSchema,
  topOrganizationSchema,
  seriesGrowthPointSchema,
  statusBucketSchema,
  statusFunnelResponseSchema,
  userGrowthResponseSchema,
} from "@/features/admin-analytics/schemas/analytics.schema";

export type AnalyticsGranularity = z.infer<typeof analyticsGranularitySchema>;
export type AnalyticsEscrowType = z.infer<typeof analyticsEscrowTypeSchema>;
export type SeriesGrowthPoint = z.infer<typeof seriesGrowthPointSchema>;
/** @deprecated Use SeriesGrowthPoint */
export type MonthlyGrowthPoint = SeriesGrowthPoint;
export type EscrowGrowthResponse = z.infer<typeof escrowGrowthResponseSchema>;
export type UserGrowthResponse = z.infer<typeof userGrowthResponseSchema>;
export type RevenueAsset = z.infer<typeof revenueAssetSchema>;
export type RevenueBucket = z.infer<typeof revenueBucketSchema>;
export type RevenueByTokenResponse = z.infer<typeof revenueByTokenResponseSchema>;
export type StatusBucket = z.infer<typeof statusBucketSchema>;
export type StatusFunnelResponse = z.infer<typeof statusFunnelResponseSchema>;
export type DataQualityResponse = z.infer<typeof dataQualityResponseSchema>;
export type RevenueEvent = z.infer<typeof revenueEventSchema>;
export type RevenueEventType = z.infer<typeof revenueEventTypeSchema>;
export type RevenueEventsResponse = z.infer<typeof revenueEventsResponseSchema>;
export type TopOrganization = z.infer<typeof topOrganizationSchema>;
export type TopOrganizationAsset = z.infer<typeof topOrganizationAssetSchema>;

export type RevenueEventSort = "timestamp" | "amount";
export type RevenueEventOrder = "desc" | "asc";

export type RevenueCategory = RevenueBucket["category"];

export const KNOWN_ESCROW_STATUSES = [
  "active",
  "released",
  "disputed",
] as const;

export type KnownEscrowStatus = (typeof KNOWN_ESCROW_STATUSES)[number];

export type FunnelStatusKey = KnownEscrowStatus | "other";

export type RevenueEventsQuery = {
  readonly limit: number;
  readonly offset: number;
  readonly from?: string;
  readonly to?: string;
  readonly eventType?: RevenueEventType;
  readonly sort?: RevenueEventSort;
  readonly order?: RevenueEventOrder;
  readonly search?: string;
  readonly asset?: string;
};

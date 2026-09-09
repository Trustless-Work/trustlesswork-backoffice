import { z } from "zod/v3";

export const analyticsGranularitySchema = z.enum(["day", "week", "month"]);

export const analyticsEscrowTypeSchema = z.enum([
  "single-release",
  "multi-release",
]);


export const seriesGrowthPointSchema = z.object({
  period: z.string().min(1),
  month: z.string().min(1),
  count: z.number(),
  growthPct: z.number().nullable(),
});

export const escrowGrowthResponseSchema = z.object({
  network: z.string(),
  granularity: analyticsGranularitySchema.optional(),
  data: z.array(seriesGrowthPointSchema),
});

export const userGrowthResponseSchema = z.object({
  granularity: analyticsGranularitySchema.optional(),
  data: z.array(seriesGrowthPointSchema),
});

export const revenueAssetSchema = z.object({
  address: z.string().min(1),
  symbol: z.string().nullable(),
  decimals: z.number(),
  resolved: z.boolean(),
});

export const revenueBucketSchema = z.object({
  period: z.string().min(1),
  month: z.string().min(1),
  asset: revenueAssetSchema,
  category: z.enum(["released", "resolved"]),
  releasedAmount: z.string(),
  feeAmount: z.string(),
  escrowCount: z.number(),
});

export const revenueByTokenResponseSchema = z.object({
  network: z.string(),
  feeBps: z.number(),
  granularity: analyticsGranularitySchema.optional(),
  data: z.array(revenueBucketSchema),
});

export const statusBucketSchema = z.object({
  status: z.string().nullable(),
  count: z.number(),
});

export const statusFunnelResponseSchema = z.object({
  network: z.string(),
  data: z.array(statusBucketSchema),
  removedCount: z.number(),
  shellCount: z.number(),
});

export const dataQualityResponseSchema = z.object({
  network: z.string(),
  openGaps: z.number(),
  shellRows: z.number(),
  removedEscrows: z.number(),
  missingChainClock: z.number(),
  unbackfilledReleased: z.number(),
});

export const revenueEventOrganizationSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    /** Core may omit this on some analytics payloads (e.g. escrows/top). */
    archived: z.boolean().default(false),
  })
  .nullable();

export const revenueEventTypeSchema = z.enum(["release", "resolve_dispute"]);

export const revenueEventSchema = z.object({
  escrowId: z.string().min(1),
  engagementId: z.string().nullable(),
  type: analyticsEscrowTypeSchema.nullish(),
  eventType: revenueEventTypeSchema,
  createdAt: z.string().min(1),
  txHash: z.string().nullable(),
  organization: revenueEventOrganizationSchema,
  asset: revenueAssetSchema,
  amount: z.string(),
  feeAmount: z.string(),
  attributesRevenue: z.boolean(),
});

export const topOrganizationAssetSchema = z.object({
  asset: revenueAssetSchema,
  escrowCount: z.number(),
  releasedAmount: z.string(),
  feeAmount: z.string(),
});

export const topOrganizationSchema = z.object({
  organization: revenueEventOrganizationSchema,
  escrowCount: z.number(),
  byAsset: z.array(topOrganizationAssetSchema),
});

export const revenueEventsPaginationSchema = z.object({
  limit: z.number(),
  offset: z.number(),
  total: z.number(),
});

export const revenueEventsResponseSchema = z.object({
  network: z.string(),
  feeBps: z.number(),
  data: z.array(revenueEventSchema),
  pagination: revenueEventsPaginationSchema,
  escrowTotal: z.number(),
  topOrganizations: z.array(topOrganizationSchema),
});

/** @deprecated Use seriesGrowthPointSchema */
export const monthlyGrowthPointSchema = seriesGrowthPointSchema;

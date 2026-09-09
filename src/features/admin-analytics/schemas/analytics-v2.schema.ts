import { z } from "zod/v3";
import {
  analyticsEscrowTypeSchema,
  analyticsGranularitySchema,
  revenueAssetSchema,
  revenueEventOrganizationSchema,
} from "@/features/admin-analytics/schemas/analytics.schema";

export const topEscrowSchema = z.object({
  escrowId: z.string().min(1),
  engagementId: z.string().nullable(),
  type: analyticsEscrowTypeSchema.nullish(),
  status: z.string().nullable(),
  organization: revenueEventOrganizationSchema,
  createdAt: z.string().nullable(),
  amount: z.string().nullable(),
  releasedAmount: z.string().nullable(),
  feeAmount: z.string().nullable(),
});

export const topEscrowsByAssetSchema = z.object({
  asset: revenueAssetSchema,
  escrows: z.array(topEscrowSchema),
});

export const escrowsTopResponseSchema = z.object({
  network: z.string(),
  feeBps: z.number().optional(),
  by: z.enum(["amount", "fee"]),
  data: z.array(topEscrowsByAssetSchema),
});

export const conversionBucketSchema = z.object({
  period: z.string().min(1),
  month: z.string().min(1),
  created: z.number(),
  converted: z.number(),
  conversionPct: z.number().nullable(),
});

export const escrowConversionResponseSchema = z.object({
  network: z.string(),
  granularity: analyticsGranularitySchema.optional(),
  totals: z.object({
    created: z.number(),
    converted: z.number(),
    conversionPct: z.number().nullable(),
  }),
  data: z.array(conversionBucketSchema),
});

export const volumeVsFeesBucketSchema = z.object({
  period: z.string().min(1),
  month: z.string().min(1),
  asset: revenueAssetSchema,
  createdVolume: z.string(),
  createdCount: z.number(),
  releasedVolume: z.string(),
  releasedCount: z.number(),
  feeAmount: z.string(),
});

export const volumeVsFeesResponseSchema = z.object({
  network: z.string(),
  granularity: analyticsGranularitySchema.optional(),
  data: z.array(volumeVsFeesBucketSchema),
});

export const escrowAveragesAssetSchema = z.object({
  asset: revenueAssetSchema,
  createdCount: z.number(),
  totalAmount: z.string(),
  avgTicket: z.string().nullable(),
  releasedCount: z.number(),
  totalReleased: z.string(),
  avgReleased: z.string().nullable(),
  totalFee: z.string(),
  avgFee: z.string().nullable(),
});

export const escrowAveragesResponseSchema = z.object({
  network: z.string(),
  data: z.array(escrowAveragesAssetSchema),
});

export const apiKeysSummaryResponseSchema = z.object({
  totalKeys: z.number(),
  activeKeys: z.number(),
  revokedKeys: z.number(),
  expiredKeys: z.number(),
  newInPeriod: z.number(),
  withActivityInPeriod: z.number(),
  neverUsed: z.number(),
  usageTrackedSince: z.string().nullable(),
});

export const apiKeyTopByAssetSchema = z.object({
  asset: revenueAssetSchema,
  escrowCount: z.number(),
  releasedAmount: z.string(),
  feeAmount: z.string(),
});

export const apiKeyTopItemSchema = z.object({
  keyId: z.string().min(1),
  description: z.string().nullable(),
  active: z.boolean(),
  organization: revenueEventOrganizationSchema,
  escrowCount: z.number().optional(),
  byAsset: z.array(apiKeyTopByAssetSchema).optional(),
  requestCount: z.string().optional(),
});

export const apiKeysTopResponseSchema = z.object({
  network: z.string().optional(),
  feeBps: z.number().optional(),
  by: z.enum(["revenue", "volume", "escrows", "requests"]),
  attribution: z.literal("platform").nullable().optional(),
  data: z.array(apiKeyTopItemSchema),
});

export const apiKeyEscrowStatSchema = z.object({
  asset: revenueAssetSchema,
  escrowCount: z.number(),
  releasedAmount: z.string(),
  feeAmount: z.string(),
});

export const apiKeyUsageDaySchema = z.object({
  day: z.string().min(1),
  requestCount: z.string(),
});

export const apiKeyDetailResponseSchema = z.object({
  network: z.string().optional(),
  feeBps: z.number().optional(),
  keyId: z.string().min(1),
  description: z.string().nullable(),
  roles: z.array(z.string()),
  active: z.boolean(),
  createdAt: z.string().min(1),
  expiresAt: z.string().nullable(),
  lastUsedAt: z.string().nullable(),
  lastUsedIp: z.string().nullable(),
  organization: revenueEventOrganizationSchema,
  attribution: z.literal("platform").nullable(),
  escrowStats: z.array(apiKeyEscrowStatSchema),
  usage: z.array(apiKeyUsageDaySchema),
});

import type { z } from "zod/v3";
import type {
  apiKeyDetailResponseSchema,
  apiKeysSummaryResponseSchema,
  apiKeysTopResponseSchema,
  escrowAveragesResponseSchema,
  escrowConversionResponseSchema,
  escrowsTopResponseSchema,
  volumeVsFeesResponseSchema,
} from "@/features/admin-analytics/schemas/analytics-v2.schema";

export type EscrowsTopResponse = z.infer<typeof escrowsTopResponseSchema>;
export type EscrowConversionResponse = z.infer<
  typeof escrowConversionResponseSchema
>;
export type VolumeVsFeesResponse = z.infer<typeof volumeVsFeesResponseSchema>;
export type EscrowAveragesResponse = z.infer<
  typeof escrowAveragesResponseSchema
>;
export type ApiKeysSummaryResponse = z.infer<
  typeof apiKeysSummaryResponseSchema
>;
export type ApiKeysTopResponse = z.infer<typeof apiKeysTopResponseSchema>;
export type ApiKeyDetailResponse = z.infer<typeof apiKeyDetailResponseSchema>;

export type EscrowsTopBy = EscrowsTopResponse["by"];
export type ApiKeysTopBy = ApiKeysTopResponse["by"];

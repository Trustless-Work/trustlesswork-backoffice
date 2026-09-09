import Decimal from "decimal.js";
import type { AnalyticsGranularity } from "@/features/admin-analytics/types/analytics.types";
import type {
  TopOrganization,
  TopOrganizationAsset,
} from "@/features/admin-analytics/types/analytics.types";

export function rankTopOrganizations(
  organizations: readonly TopOrganization[],
  selectedAssetAddress: string | null,
): TopOrganization[] {
  const sorted = [...organizations];

  if (selectedAssetAddress) {
    sorted.sort((left, right) => {
      const leftFee = feeForAsset(left, selectedAssetAddress);
      const rightFee = feeForAsset(right, selectedAssetAddress);
      return new Decimal(rightFee).cmp(new Decimal(leftFee));
    });
    return sorted;
  }

  sorted.sort((left, right) => right.escrowCount - left.escrowCount);
  return sorted;
}

export function feeForAsset(
  organization: TopOrganization,
  assetAddress: string,
): string {
  const match = organization.byAsset.find(
    (entry) => entry.asset.address === assetAddress,
  );
  return match?.feeAmount ?? "0";
}

export function assetBreakdownForOrganization(
  organization: TopOrganization,
  assetAddress: string | null,
): TopOrganizationAsset | null {
  if (!assetAddress) {
    return organization.byAsset[0] ?? null;
  }
  return (
    organization.byAsset.find((entry) => entry.asset.address === assetAddress) ??
    null
  );
}

export const TRAILING_COHORT_PERIODS: Record<AnalyticsGranularity, number> = {
  month: 1,
  week: 2,
  day: 7,
};

export function isTrailingCohortIndex(
  index: number,
  totalBuckets: number,
  granularity: AnalyticsGranularity,
): boolean {
  const trailing = TRAILING_COHORT_PERIODS[granularity];
  return index >= totalBuckets - trailing;
}

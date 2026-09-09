"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NoData } from "@/components/shared/NoData";
import { Building2Icon } from "lucide-react";
import {
  DashboardCard,
  DashboardCardTitle,
} from "@/components/dashboard/dashboard-card";
import type { TopOrganization } from "@/features/admin-analytics/types/analytics.types";
import { RevenueAssetAmount } from "@/features/admin-analytics/ui/RevenueAssetAmount";
import {
  assetBreakdownForOrganization,
  feeForAsset,
  rankTopOrganizations,
} from "@/features/admin-analytics/utils/top-organizations.util";
import { formatOrganizationName } from "@/features/admin-analytics/utils/revenue.util";
import Decimal from "decimal.js";

type TopOrganizationsCardProps = {
  organizations: readonly TopOrganization[];
  selectedAssetAddress: string | null;
  isAllAssets: boolean;
};

export const TopOrganizationsCard = ({
  organizations,
  selectedAssetAddress,
  isAllAssets,
}: TopOrganizationsCardProps) => {
  const ranked = rankTopOrganizations(organizations, selectedAssetAddress);
  const maxFee = ranked.reduce((max, org) => {
    const fee = selectedAssetAddress
      ? feeForAsset(org, selectedAssetAddress)
      : String(org.escrowCount);
    return Decimal.max(max, new Decimal(fee));
  }, new Decimal(0));

  if (ranked.length === 0) {
    return (
      <DashboardCard className="gap-4">
        <DashboardCardTitle>Top organizations</DashboardCardTitle>
        <NoData
          icon={Building2Icon}
          title="No organizations"
          description="No attributed revenue in the selected range."
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DashboardCardTitle>Top organizations</DashboardCardTitle>
        {isAllAssets ? (
          <Badge variant="outline">Ranked by escrow count</Badge>
        ) : (
          <Badge variant="outline">Ranked by fee</Badge>
        )}
      </div>
      <ul className="flex flex-col gap-3">
        {ranked.map((org, index) => {
          const breakdown = assetBreakdownForOrganization(
            org,
            selectedAssetAddress,
          );
          const metric = selectedAssetAddress
            ? feeForAsset(org, selectedAssetAddress)
            : String(org.escrowCount);
          const progress =
            maxFee.gt(0)
              ? new Decimal(metric).div(maxFee).times(100).toNumber()
              : 0;

          return (
            <li key={org.organization?.id ?? `unattributed-${index}`}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {index + 1}.
                  </span>
                  <span className="truncate text-sm font-medium">
                    {formatOrganizationName(org.organization)}
                  </span>
                  {org.organization?.archived ? (
                    <Badge variant="secondary">Archived</Badge>
                  ) : null}
                </div>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {org.escrowCount} escrows
                </span>
              </div>
              <Progress className="h-1.5" value={progress} />
              {breakdown && selectedAssetAddress ? (
                <div className="mt-1 flex justify-end">
                  <RevenueAssetAmount
                    align="right"
                    amount={breakdown.feeAmount}
                    asset={breakdown.asset}
                    size="sm"
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
};

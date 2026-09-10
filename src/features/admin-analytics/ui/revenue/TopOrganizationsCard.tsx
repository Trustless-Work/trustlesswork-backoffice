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
import { cn } from "@/lib/utils";

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
      <ul className="flex flex-col gap-1">
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
            <li
              key={org.organization?.id ?? `unattributed-${index}`}
              className="rounded-xl px-2 py-2.5 hover:bg-muted/40"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums",
                    index === 0
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-sm font-medium">
                          {formatOrganizationName(org.organization)}
                        </span>
                        {org.organization?.archived ? (
                          <Badge variant="secondary">Archived</Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {org.escrowCount}{" "}
                        {org.escrowCount === 1 ? "escrow" : "escrows"}
                      </p>
                    </div>
                    {breakdown && selectedAssetAddress ? (
                      <RevenueAssetAmount
                        align="right"
                        amount={breakdown.feeAmount}
                        asset={breakdown.asset}
                        size="sm"
                      />
                    ) : null}
                  </div>
                  <Progress className="h-1.5" value={progress} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
};

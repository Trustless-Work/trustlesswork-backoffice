"use client";

import { StatGrid } from "@/components/dashboard/stat-grid";
import {
  DashboardCard,
  DashboardCardTitle,
} from "@/components/dashboard/dashboard-card";
import type { EscrowAveragesResponse } from "@/features/admin-analytics/types/analytics-v2.types";
import { RevenueAssetAmount } from "@/features/admin-analytics/ui/RevenueAssetAmount";
import { resolveAssetSymbol } from "@/features/admin-analytics/utils/revenue.util";

type RevenueAveragesSectionProps = {
  data: EscrowAveragesResponse;
};

function formatNullableAmount(
  value: string | null,
  fallback = "—",
): string {
  return value ?? fallback;
}

export const RevenueAveragesSection = ({
  data,
}: RevenueAveragesSectionProps) => {
  if (data.data.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {data.data.map((assetRow) => (
        <DashboardCard key={assetRow.asset.address} className="gap-4">
          <DashboardCardTitle>
            Averages — {resolveAssetSymbol(assetRow.asset)}
            {!assetRow.asset.resolved ? " *" : ""}
          </DashboardCardTitle>
          <StatGrid
            columns={4}
            stats={[
              {
                label: "Created",
                value: String(assetRow.createdCount),
                delta: null,
                hint: "in range",
              },
              {
                label: "Avg ticket",
                value: formatNullableAmount(assetRow.avgTicket),
                delta: null,
                hint: "funded at creation",
              },
              {
                label: "Released",
                value: String(assetRow.releasedCount),
                delta: null,
                hint: "revenue population",
              },
              {
                label: "Avg fee",
                value: assetRow.avgFee ? (
                  <RevenueAssetAmount
                    amount={assetRow.avgFee}
                    asset={assetRow.asset}
                    emphasis
                    size="lg"
                  />
                ) : (
                  "—"
                ),
                delta: null,
                hint: "per released escrow",
              },
            ]}
          />
        </DashboardCard>
      ))}
    </div>
  );
};

"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DEFAULT_ANALYTICS_RANGE } from "@/features/admin-analytics/constants/analytics-range";
import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import type { AnalyticsTabId } from "@/features/admin-analytics/constants/analytics-tabs";
import type {
  ApiKeysTopBy,
  EscrowsTopBy,
} from "@/features/admin-analytics/types/analytics-v2.types";
import { useDataQuality } from "@/features/admin-analytics/hooks/useAdminAnalytics";
import { useRevenueFilters } from "@/features/admin-analytics/hooks/useRevenueFilters";
import { AdminAnalyticsSkeleton } from "@/features/admin-analytics/ui/AdminAnalyticsSkeleton";
import {
  AnalyticsTabs,
  resolveAnalyticsTab,
} from "@/features/admin-analytics/ui/AnalyticsTabs";
import { DataQualityBanner } from "@/features/admin-analytics/ui/DataQualityBanner";
import { ApiKeysFiltersPopover } from "@/features/admin-analytics/ui/filters/ApiKeysFiltersPopover";
import { EscrowsFiltersPopover } from "@/features/admin-analytics/ui/filters/EscrowsFiltersPopover";
import { RevenueFiltersPopover } from "@/features/admin-analytics/ui/filters/RevenueFiltersPopover";
import { GrowthTabSkeleton } from "@/features/admin-analytics/ui/tabs/GrowthTabSkeleton";
import { RevenueTabSkeleton } from "@/features/admin-analytics/ui/tabs/RevenueTabSkeleton";
import { EscrowsTabSkeleton } from "@/features/admin-analytics/ui/tabs/EscrowsTabSkeleton";
import { ApiKeysTabSkeleton } from "@/features/admin-analytics/ui/tabs/ApiKeysTabSkeleton";

const GrowthTab = dynamic(
  () =>
    import("@/features/admin-analytics/ui/tabs/GrowthTab").then((mod) => ({
      default: mod.GrowthTab,
    })),
  { loading: () => <GrowthTabSkeleton /> },
);

const RevenueTab = dynamic(
  () =>
    import("@/features/admin-analytics/ui/tabs/RevenueTab").then((mod) => ({
      default: mod.RevenueTab,
    })),
  { loading: () => <RevenueTabSkeleton /> },
);

const EscrowsTab = dynamic(
  () =>
    import("@/features/admin-analytics/ui/tabs/EscrowsTab").then((mod) => ({
      default: mod.EscrowsTab,
    })),
  { loading: () => <EscrowsTabSkeleton /> },
);

const ApiKeysTab = dynamic(
  () =>
    import("@/features/admin-analytics/ui/tabs/ApiKeysTab").then((mod) => ({
      default: mod.ApiKeysTab,
    })),
  { loading: () => <ApiKeysTabSkeleton /> },
);

export const AdminAnalyticsView = () => {
  const searchParams = useSearchParams();
  const activeTab = resolveAnalyticsTab(searchParams.get("tab"));
  const [range, setRange] = useState<AnalyticsRange>(DEFAULT_ANALYTICS_RANGE);
  const [escrowsTopBy, setEscrowsTopBy] = useState<EscrowsTopBy>("amount");
  const [apiKeysTopBy, setApiKeysTopBy] = useState<ApiKeysTopBy>("revenue");
  const revenueFilters = useRevenueFilters();
  const dataQualityQuery = useDataQuality();

  const handleRangeChange = useCallback((nextRange: AnalyticsRange) => {
    setRange(nextRange);
  }, []);

  const filtersByTab: Record<AnalyticsTabId, React.ReactNode> = {
    growth: null,
    revenue: <RevenueFiltersPopover controller={revenueFilters} range={range} />,
    escrows: (
      <EscrowsFiltersPopover
        topBy={escrowsTopBy}
        onTopByChange={setEscrowsTopBy}
      />
    ),
    "api-keys": (
      <ApiKeysFiltersPopover
        topBy={apiKeysTopBy}
        onTopByChange={setApiKeysTopBy}
      />
    ),
  };

  return (
    <div className="flex flex-col gap-4">
      <DataQualityBanner data={dataQualityQuery.data} />

      <Suspense fallback={<AdminAnalyticsSkeleton />}>
        <AnalyticsTabs
          activeTab={activeTab}
          apiKeysContent={<ApiKeysTab range={range} topBy={apiKeysTopBy} />}
          escrowsContent={<EscrowsTab range={range} topBy={escrowsTopBy} />}
          filtersContent={filtersByTab[activeTab]}
          growthContent={<GrowthTab range={range} />}
          range={range}
          revenueContent={
            <RevenueTab filters={revenueFilters.filters} range={range} />
          }
          onRangeChange={handleRangeChange}
        />
      </Suspense>
    </div>
  );
};

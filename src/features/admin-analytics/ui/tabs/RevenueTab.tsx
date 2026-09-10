"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2Icon,
  ChartColumnIcon,
  ChartPieIcon,
  GaugeIcon,
  ScrollTextIcon,
  SigmaIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ALL_ASSETS_VALUE } from "@/features/admin-analytics/constants/analytics-filters";
import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import {
  useEscrowAverages,
  useRevenueByToken,
  useRevenueEvents,
  useVolumeVsFees,
} from "@/features/admin-analytics/hooks/useAdminAnalytics";
import { resolveResponseGranularity } from "@/features/admin-analytics/utils/analytics-range.util";
import { AnalyticsSection } from "@/features/admin-analytics/ui/AnalyticsSection";
import { RevenueChartsSection } from "@/features/admin-analytics/ui/revenue/RevenueChartsSection";
import { RevenueAveragesSection } from "@/features/admin-analytics/ui/revenue/RevenueAveragesSection";
import { TopOrganizationsCard } from "@/features/admin-analytics/ui/revenue/TopOrganizationsCard";
import {
  getDefaultVolumeVsFeesAssetKey,
  VolumeVsFeesChart,
} from "@/features/admin-analytics/ui/revenue/VolumeVsFeesChart";
import { RevenueLedgerSection } from "@/features/admin-analytics/ui/revenue/RevenueLedgerSection";
import { RevenueStatsGrid } from "@/features/admin-analytics/ui/revenue/RevenueStatsGrid";
import {
  buildCategoryDonutSlices,
  buildCategoryLineSeries,
  buildRevenueChartSeries,
  buildTokenDonutSlices,
  hasUnresolvedAssets,
  resolveAssetSymbol,
} from "@/features/admin-analytics/utils/revenue.util";
import type { RevenueFilters } from "@/features/admin-analytics/types/analytics-filters.types";
import { RevenueTabSkeleton } from "@/features/admin-analytics/ui/tabs/RevenueTabSkeleton";
import { listVolumeVsFeesAssets } from "@/features/admin-analytics/utils/volume-vs-fees.util";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const EVENTS_PAGE_SIZE = 25;

type RevenueTabProps = {
  range: AnalyticsRange;
  filters: RevenueFilters;
};

export const RevenueTab = ({ range, filters }: RevenueTabProps) => {
  const [eventsOffset, setEventsOffset] = useState(0);
  const { asset: assetFilter, eventType, order, search, sort } = filters;

  const query = useRevenueByToken(range);
  const volumeQuery = useVolumeVsFees(range);
  const averagesQuery = useEscrowAverages(range);
  const eventsQuery = useRevenueEvents(range, {
    limit: EVENTS_PAGE_SIZE,
    offset: eventsOffset,
    eventType,
    sort,
    order,
    search: search || undefined,
    asset: assetFilter === ALL_ASSETS_VALUE ? undefined : assetFilter,
  });

  const buckets = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const granularity = resolveResponseGranularity(
    query.data?.granularity,
    range.granularity,
  );

  const chartSeries = useMemo(
    () => buildRevenueChartSeries(buckets),
    [buckets],
  );
  const categoryLineSeries = useMemo(
    () => buildCategoryLineSeries(buckets),
    [buckets],
  );
  const categorySlices = useMemo(
    () => buildCategoryDonutSlices(buckets, CHART_COLORS),
    [buckets],
  );
  const tokenSlices = useMemo(
    () => buildTokenDonutSlices(buckets, CHART_COLORS),
    [buckets],
  );

  const tokenKeys = useMemo(
    () => [
      ...new Set(buckets.map((bucket) => resolveAssetSymbol(bucket.asset))),
    ],
    [buckets],
  );

  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        tokenKeys.map((token, index) => [
          token,
          {
            label: token,
            color: CHART_COLORS[index % CHART_COLORS.length],
          },
        ]),
      ),
    [tokenKeys],
  );

  const volumeAssetKey = useMemo(() => {
    if (!volumeQuery.data) {
      return null;
    }
    const assets = listVolumeVsFeesAssets(volumeQuery.data);
    const preferred = assets.find((key) => key.includes(assetFilter));
    return preferred ?? getDefaultVolumeVsFeesAssetKey(volumeQuery.data);
  }, [assetFilter, volumeQuery.data]);

  useEffect(() => {
    setEventsOffset(0);
  }, [
    range.granularity,
    range.periods,
    sort,
    order,
    search,
    assetFilter,
    eventType,
  ]);

  if (query.isPending) {
    return <RevenueTabSkeleton />;
  }

  const isAllAssets = assetFilter === ALL_ASSETS_VALUE;

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {query.errorMessage ? (
        <p className="text-pretty text-muted-foreground text-sm">
          {query.errorMessage}
        </p>
      ) : null}

      {hasUnresolvedAssets(buckets) ? (
        <Badge variant="outline">* unresolved token decimals</Badge>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[.6fr_.4fr] lg:gap-6 xl:gap-8">
        <AnalyticsSection
          description="Platform fee totals and event volume for the selected range and asset filter."
          icon={GaugeIcon}
          title="Overview"
        >
          <RevenueStatsGrid
            buckets={buckets}
            eventType={eventType}
            eventsPending={eventsQuery.isPending}
            eventsTotal={eventsQuery.data?.pagination.total ?? 0}
            feeBps={query.data?.feeBps}
          />
        </AnalyticsSection>

        <AnalyticsSection
          description="Organizations driving the most revenue."
          icon={Building2Icon}
          title="Leaders"
        >
          <TopOrganizationsCard
            isAllAssets={isAllAssets}
            organizations={eventsQuery.data?.topOrganizations ?? []}
            selectedAssetAddress={isAllAssets ? null : assetFilter}
          />
        </AnalyticsSection>
      </div>

      <AnalyticsSection
        description="How fees break down by release path, category, and token over time."
        icon={ChartPieIcon}
        title="Fee mix"
      >
        <RevenueChartsSection
          categoryLineSeries={categoryLineSeries}
          categorySlices={categorySlices}
          chartConfig={chartConfig}
          chartSeries={chartSeries}
          granularity={granularity}
          tokenKeys={tokenKeys}
          tokenSlices={tokenSlices}
        />
      </AnalyticsSection>

      {volumeQuery.data && volumeAssetKey ? (
        <AnalyticsSection
          description="Created and released volume versus platform take over time."
          icon={ChartColumnIcon}
          title="Volume vs fees"
        >
          <VolumeVsFeesChart
            assetKey={volumeAssetKey}
            data={volumeQuery.data}
            granularity={granularity}
          />
        </AnalyticsSection>
      ) : null}

      {averagesQuery.data ? (
        <AnalyticsSection
          description="Creation and revenue averages use different escrow populations — do not divide fields across groups."
          icon={SigmaIcon}
          title="Averages"
        >
          <RevenueAveragesSection data={averagesQuery.data} />
        </AnalyticsSection>
      ) : null}

      <AnalyticsSection
        description="Dimmed rows are audit history — only attributing rows count toward revenue totals."
        icon={ScrollTextIcon}
        title="Revenue ledger"
      >
        <RevenueLedgerSection
          escrowTotal={eventsQuery.data?.escrowTotal ?? 0}
          errorMessage={eventsQuery.errorMessage}
          events={eventsQuery.data?.data ?? []}
          isLoading={eventsQuery.isPending}
          limit={EVENTS_PAGE_SIZE}
          offset={eventsOffset}
          total={eventsQuery.data?.pagination.total ?? 0}
          onPageChange={setEventsOffset}
        />
      </AnalyticsSection>
    </div>
  );
};

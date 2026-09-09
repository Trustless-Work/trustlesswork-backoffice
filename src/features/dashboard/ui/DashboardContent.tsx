"use client";

import { cn } from "@/lib/utils";
import { useDashboardMetrics } from "@/features/dashboard/hooks/useDashboardMetrics";
import { DashboardStats } from "./stats";
import { DashboardCardSeparator } from "@/components/dashboard/dashboard-card";
import { MorChart } from "./mor-chart";
import { BudgetSentenceInsight } from "./budget-sentence-insight";
import { BudgetUsage } from "./budget-usage";
import { OrdersChart } from "./orders-chart";
import { TotalRevenue } from "./total-revenue";
import { ActiveCustomers } from "./active-customers";
import { FedIncomeTax } from "./fed-income-tax";
import { NeedsAttention } from "./needs-attention";
import { DashboardSkeleton } from "./dashboard-skeleton";

export const DashboardContent = () => {
  const { metrics, isLoading, isError } = useDashboardMetrics();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      {isError ? (
        <p className="text-pretty text-muted-foreground text-sm">
          Could not load escrow metrics for this organization. Charts below may
          be empty until the request succeeds.
        </p>
      ) : null}

      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          "lg:grid-cols-[.68fr_.32fr] xl:grid-cols-[.70fr_.30fr]",
          "*:grid *:h-max *:gap-2",
        )}
      >
        <div>
          <DashboardStats stats={metrics.stats} />
          <DashboardCardSeparator />
          <MorChart
            deltaPct={metrics.volumeDeltaPct}
            latestVolume={metrics.volumeLatest}
            series={metrics.volumeSeries}
          />
          <DashboardCardSeparator />
          <div className="flex flex-col gap-2 py-4 xl:flex-row">
            <BudgetSentenceInsight
              pendingReleasePct={metrics.insightPendingReleasePct}
            />
            <DashboardCardSeparator
              className="block xl:hidden"
              orientation="horizontal"
            />
            <DashboardCardSeparator
              className="hidden xl:block"
              orientation="vertical"
            />
            <BudgetUsage
              segments={metrics.budgetSegments}
              total={metrics.budgetTotal}
            />
          </div>
          <DashboardCardSeparator />
          <OrdersChart
            deltaPct={metrics.createdDeltaPct}
            peakDate={metrics.createdPeakDate}
            series={metrics.createdSeries}
            total={metrics.createdTotal}
          />
        </div>
        <div className="relative">
          <DashboardCardSeparator
            className="absolute inset-y-0 -left-2 hidden h-full w-px lg:block"
            orientation="vertical"
          />
          <DashboardCardSeparator
            className="block lg:hidden"
            orientation="horizontal"
          />
          <TotalRevenue
            releasedShare={metrics.releasedShare}
            totalDeposited={metrics.totalDeposited}
          />
          <DashboardCardSeparator />
          <ActiveCustomers
            multiRelease={metrics.typeMix.multiRelease}
            singleRelease={metrics.typeMix.singleRelease}
            total={metrics.typeMix.total}
          />
          <DashboardCardSeparator />
          <FedIncomeTax
            nextRelease={metrics.nextRelease}
            platformFeesTotal={metrics.platformFeesTotal}
          />
          <DashboardCardSeparator />
          <NeedsAttention items={metrics.attention} />
        </div>
      </div>
    </div>
  );
};

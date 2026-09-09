import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DashboardCard,
  DashboardCardSeparator,
} from "@/components/dashboard/dashboard-card";
import { AnalyticsSectionSkeleton } from "@/features/admin-analytics/ui/AnalyticsSectionSkeleton";
import { RevenueEventsTableSkeleton } from "@/features/admin-analytics/ui/RevenueEventsTableSkeleton";

const ChartRegionSkeleton = ({ className }: { className?: string }) => (
  <Skeleton className={cn("w-full rounded-lg", className)} />
);

const STAT_CARD_SKELETONS = [
  { titleWidth: "w-20", withAssetIcon: true, hintWidth: "w-24" },
  { titleWidth: "w-20", withAssetIcon: true, hintWidth: "w-24" },
  { titleWidth: "w-16", withAssetIcon: true, hintWidth: "w-24" },
  { titleWidth: "w-32", withAssetIcon: false, hintWidth: "w-28" },
  { titleWidth: "w-28", withAssetIcon: false, hintWidth: "w-28" },
] as const;

const StatCardSkeleton = ({
  titleWidth,
  withAssetIcon,
  hintWidth,
}: {
  titleWidth: string;
  withAssetIcon: boolean;
  hintWidth: string;
}) => (
  <DashboardCard className="group">
    <DashboardCardSeparator
      className="absolute bottom-0 group-last:hidden lg:hidden"
      orientation="horizontal"
    />
    <DashboardCardSeparator
      className="absolute right-0 hidden h-full group-last:hidden lg:block lg:group-[:nth-child(3n)]:hidden"
      orientation="vertical"
    />

    <div className="flex min-w-0 flex-col justify-center gap-2">
      <Skeleton className={cn("h-3", titleWidth)} />
      {withAssetIcon ? (
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <Skeleton className="h-8 w-24" />
        </div>
      ) : (
        <Skeleton className="h-8 w-16" />
      )}
    </div>

    <div className="flex flex-wrap items-center gap-1 text-xs">
      <Skeleton className="h-3 w-3" />
      <Skeleton className={cn("h-3", hintWidth)} />
    </div>
  </DashboardCard>
);

export const RevenueTabSkeleton = () => (
  <div className="flex flex-col gap-8 md:gap-10">
    <AnalyticsSectionSkeleton>
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {STAT_CARD_SKELETONS.map((stat, index) => (
          <StatCardSkeleton key={index} {...stat} />
        ))}
      </div>
    </AnalyticsSectionSkeleton>

    <AnalyticsSectionSkeleton descriptionWidth="w-80" titleWidth="w-24">
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          "lg:grid-cols-[.68fr_.32fr] xl:grid-cols-[.70fr_.30fr]",
        )}
      >
        <div className="flex flex-col gap-4">
          <DashboardCard className="gap-4">
            <Skeleton className="h-3 w-36" />
            <ChartRegionSkeleton className="aspect-16/5 w-full" />
          </DashboardCard>

          <DashboardCardSeparator />

          <DashboardCard className="gap-4">
            <Skeleton className="h-3 w-40" />
            <ChartRegionSkeleton className="aspect-16/5 w-full" />
          </DashboardCard>
        </div>

        <div className="relative flex flex-col gap-4">
          <DashboardCardSeparator
            className="absolute inset-y-0 -left-2 hidden h-full w-px lg:block"
            orientation="vertical"
          />
          <DashboardCardSeparator className="block lg:hidden" />

          <DashboardCard className="gap-4">
            <Skeleton className="h-3 w-32" />
            <ChartRegionSkeleton className="aspect-square max-h-72 w-full" />
          </DashboardCard>

          <DashboardCard className="gap-4">
            <Skeleton className="h-3 w-28" />
            <ChartRegionSkeleton className="aspect-square max-h-72 w-full" />
          </DashboardCard>
        </div>
      </div>
    </AnalyticsSectionSkeleton>

    <AnalyticsSectionSkeleton descriptionWidth="w-96" titleWidth="w-36">
      <DashboardCard className="gap-4">
        <RevenueEventsTableSkeleton />
      </DashboardCard>
    </AnalyticsSectionSkeleton>
  </div>
);

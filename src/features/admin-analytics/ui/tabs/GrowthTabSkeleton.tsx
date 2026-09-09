import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DashboardCard,
  DashboardCardSeparator,
} from "@/components/dashboard/dashboard-card";
import { AnalyticsSectionSkeleton } from "@/features/admin-analytics/ui/AnalyticsSectionSkeleton";

const ChartRegionSkeleton = ({ className }: { className?: string }) => (
  <Skeleton className={cn("w-full rounded-lg", className)} />
);

export const GrowthTabSkeleton = () => (
  <div className="flex flex-col gap-8 md:gap-10">
    <AnalyticsSectionSkeleton>
      <div className="grid grid-cols-1 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardCard key={index}>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-8 w-20" />
            <div className="mt-2 flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
          </DashboardCard>
        ))}
      </div>
    </AnalyticsSectionSkeleton>

    <AnalyticsSectionSkeleton descriptionWidth="w-64" titleWidth="w-36">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
        <DashboardCard className="gap-4">
          <DashboardCardSeparator
            className="absolute bottom-0 lg:hidden"
            orientation="horizontal"
          />
          <DashboardCardSeparator
            className="absolute right-0 hidden h-full lg:block"
            orientation="vertical"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-3 w-28" />
              <Separator className="h-3.5" orientation="vertical" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
          <ChartRegionSkeleton className="aspect-auto h-64 md:h-72" />
        </DashboardCard>

        <DashboardCard className="gap-4">
          <Skeleton className="h-3 w-48" />
          <ChartRegionSkeleton className="aspect-auto h-64 md:h-72" />
        </DashboardCard>
      </div>
    </AnalyticsSectionSkeleton>

    <AnalyticsSectionSkeleton descriptionWidth="w-72" titleWidth="w-44">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
        <DashboardCard className="gap-4">
          <DashboardCardSeparator
            className="absolute bottom-0 lg:hidden"
            orientation="horizontal"
          />
          <DashboardCardSeparator
            className="absolute right-0 hidden h-full lg:block"
            orientation="vertical"
          />

          <Skeleton className="h-3 w-56" />
          <ChartRegionSkeleton className="aspect-auto h-64 md:h-72" />
        </DashboardCard>

        <DashboardCard className="gap-4">
          <Skeleton className="h-3 w-40" />
          <ChartRegionSkeleton className="aspect-auto h-64 md:h-72" />
        </DashboardCard>
      </div>
    </AnalyticsSectionSkeleton>
  </div>
);

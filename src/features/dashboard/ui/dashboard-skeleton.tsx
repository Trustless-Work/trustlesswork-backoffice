import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DashboardCard,
  DashboardCardSeparator,
} from "@/components/dashboard/dashboard-card";

const StatSkeleton = () => (
  <DashboardCard>
    <Skeleton className="h-3 w-28" />
    <Skeleton className="mt-2 h-8 w-20" />
    <div className="mt-2 flex items-center gap-2">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-3 w-24" />
    </div>
  </DashboardCard>
);

const ChartRegionSkeleton = ({
  className,
}: {
  className?: string;
}) => <Skeleton className={cn("w-full rounded-lg", className)} />;

const ListCardSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <DashboardCard className="gap-3">
    <Skeleton className="h-4 w-32" />
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  </DashboardCard>
);

export function DashboardSkeleton() {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        "lg:grid-cols-[.68fr_.32fr] xl:grid-cols-[.70fr_.30fr]",
        "*:grid *:h-max *:gap-2",
      )}
    >
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <StatSkeleton key={index} />
          ))}
        </div>
        <DashboardCardSeparator />
        <DashboardCard className="gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4 md:pe-4">
            <div className="flex flex-col items-start gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-4 w-36" />
          </div>
          <ChartRegionSkeleton className="aspect-auto h-60 md:h-72" />
        </DashboardCard>
        <DashboardCardSeparator />
        <div className="flex flex-col gap-2 py-4 xl:flex-row">
          <DashboardCard className="flex-1 gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-16 w-full" />
          </DashboardCard>
          <DashboardCardSeparator
            className="block xl:hidden"
            orientation="horizontal"
          />
          <DashboardCardSeparator
            className="hidden xl:block"
            orientation="vertical"
          />
          <DashboardCard className="flex-1 gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </DashboardCard>
        </div>
        <DashboardCardSeparator />
        <DashboardCard className="gap-4">
          <Skeleton className="h-4 w-24" />
          <ChartRegionSkeleton className="aspect-16/5 w-full" />
        </DashboardCard>
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
        <DashboardCard className="gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mx-auto size-36 rounded-full" />
          <Skeleton className="mx-auto h-6 w-20" />
        </DashboardCard>
        <DashboardCardSeparator />
        <ListCardSkeleton rows={4} />
        <DashboardCardSeparator />
        <ListCardSkeleton rows={3} />
        <DashboardCardSeparator />
        <ListCardSkeleton rows={3} />
      </div>
    </div>
  );
}

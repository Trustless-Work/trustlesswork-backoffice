import { Skeleton } from "@/components/ui/skeleton";
import { GrowthTabSkeleton } from "@/features/admin-analytics/ui/tabs/GrowthTabSkeleton";

export const AdminAnalyticsSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex w-fit gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-8 w-[140px]" />
    </div>
    <GrowthTabSkeleton />
  </div>
);

"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const EscrowFiltersBarSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-3 md:p-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <Skeleton className="h-9 min-w-0 flex-[1.25]" />
      <Skeleton className="h-9 min-w-0 flex-1" />
      <div className="grid min-w-0 flex-[0.95] grid-cols-2 gap-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
    <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end">
      <Skeleton className="h-9 min-w-0 flex-[1.75]" />
      <Skeleton className="h-9 min-w-0 flex-[0.9]" />
      <Skeleton className="h-9 min-w-0 flex-[1.35]" />
      <Skeleton className="h-9 min-w-0 flex-[0.75] lg:max-w-48" />
    </div>
  </div>
);

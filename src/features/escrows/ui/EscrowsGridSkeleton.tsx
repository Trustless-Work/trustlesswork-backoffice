"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const EscrowsGridSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="flex min-h-[18rem] flex-col gap-3 rounded-3xl border border-border bg-card p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="mt-auto grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

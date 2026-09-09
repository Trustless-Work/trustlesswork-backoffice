import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AnalyticsSectionSkeletonProps = {
  titleWidth?: string;
  descriptionWidth?: string;
  children: ReactNode;
  className?: string;
};

export const AnalyticsSectionSkeleton = ({
  titleWidth = "w-28",
  descriptionWidth = "w-72",
  children,
  className,
}: AnalyticsSectionSkeletonProps) => (
  <section className={cn("flex flex-col gap-4", className)}>
    <header className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Skeleton className="size-9 shrink-0 rounded-lg sm:size-10" />
        <div className="min-w-0 space-y-1.5 pt-0.5">
          <Skeleton className={cn("h-5", titleWidth)} />
          <Skeleton className={cn("h-4", descriptionWidth)} />
        </div>
      </div>
      <Separator />
    </header>
    {children}
  </section>
);

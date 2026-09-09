import { cn } from "@/lib/utils";
import type * as React from "react";
import { Separator } from "@/components/ui/separator";

function DashboardCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 overflow-hidden p-4",
        className,
      )}
      data-slot="dashboard-card"
      {...props}
    />
  );
}

function DashboardCardTitle({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-muted-foreground text-xs tracking-wide", className)}
      data-slot="dashboard-card-title"
      {...props}
    />
  );
}

function DashboardCardSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      className={cn(
        "bg-transparent from-border/30 via-border to-border/30",
        "data-[orientation=horizontal]:bg-linear-to-r",
        "data-[orientation=vertical]:bg-linear-to-b",
        className,
      )}
      data-slot="dashboard-card-separator"
      {...props}
    />
  );
}

export { DashboardCard, DashboardCardTitle, DashboardCardSeparator };

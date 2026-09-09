import Link from "next/link";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardBudgetSegment } from "@/features/dashboard/types/dashboard.types";
import { DASHBOARD_LOCALE } from "@/helpers/chart-format.helper";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";

type BudgetUsageProps = {
  total: number;
  segments: readonly DashboardBudgetSegment[];
};

function formatUsdWhole(value: number) {
  return new Intl.NumberFormat(DASHBOARD_LOCALE, {
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function BudgetUsage({ total, segments }: BudgetUsageProps) {
  return (
    <DashboardCard className="flex-1 gap-6">
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <DashboardCardTitle>Fund allocation</DashboardCardTitle>
          <span className="text-balance font-semibold text-2xl tabular-nums">
            {formatUsdWhole(total)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="text-muted-foreground" size="sm" variant="ghost">
            <Link href="/dashboard/escrows">
              <Layers
                aria-hidden="true"
                data-icon="inline-start"
                strokeWidth={2}
              />
              Manage escrows
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-1">
        {segments.map((segment) => (
          <div
            className="flex min-w-0 flex-col gap-1"
            key={segment.label}
            style={{ flex: `${Math.max(segment.pct, 1)} 1 0%` }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs tabular-nums">
                {segment.pct}%
              </span>
              <div
                aria-hidden="true"
                className="h-4 w-px shrink-0 bg-muted-foreground/35"
              />
            </div>
            <div
              className={cn("h-4 w-full min-w-0 rounded-xl")}
              style={{ backgroundColor: segment.color }}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {segments.map((segment) => (
          <div className="flex items-center gap-2" key={segment.label}>
            <span
              aria-hidden="true"
              className={cn("size-2 shrink-0 rounded-full")}
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-muted-foreground text-xs">
              {segment.label}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

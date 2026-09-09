import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  DashboardCard,
  DashboardCardSeparator,
  DashboardCardTitle,
} from "@/components/dashboard/dashboard-card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/dashboard/delta";

export type StatGridItem = {
  label: string;
  value: string | ReactNode;
  delta: number | null;
  hint: string;
};

type StatGridProps = {
  stats: readonly StatGridItem[];
  columns?: 2 | 3 | 4 | 5;
};

export function StatGrid({ stats, columns = 3 }: StatGridProps) {
  const columnClass =
    columns === 2
      ? "lg:grid-cols-2"
      : columns === 4
        ? "lg:grid-cols-4"
        : columns === 5
          ? "lg:grid-cols-5"
          : "lg:grid-cols-3";

  return (
    <div className={cn("grid grid-cols-1", columnClass)}>
      {stats.map((stat) => (
        <StatCard key={stat.label} columns={columns} stat={stat} />
      ))}
    </div>
  );
}

const LAST_IN_ROW_CLASS: Record<2 | 3 | 4 | 5, string> = {
  2: "lg:group-[:nth-child(2n)]:hidden",
  3: "lg:group-[:nth-child(3n)]:hidden",
  4: "lg:group-[:nth-child(4n)]:hidden",
  5: "lg:group-[:nth-child(5n)]:hidden",
};

function StatCard({
  stat,
  columns,
}: {
  stat: StatGridItem;
  columns: 2 | 3 | 4 | 5;
}) {
  const { label, value, delta, hint } = stat;

  return (
    <DashboardCard className="group">
      <DashboardCardSeparator
        className={cn("absolute bottom-0 group-last:hidden lg:hidden")}
        orientation="horizontal"
      />
      <DashboardCardSeparator
        className={cn(
          "absolute right-0 hidden h-full group-last:hidden lg:block",
          LAST_IN_ROW_CLASS[columns],
        )}
        orientation="vertical"
      />

      <div className="flex min-w-0 flex-col justify-center gap-2">
        <DashboardCardTitle>{label}</DashboardCardTitle>
        <div className="text-balance font-medium text-2xl tabular-nums tracking-tight">
          {value}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1 text-xs">
        {delta === null ? (
          <span className="text-muted-foreground tabular-nums">—</span>
        ) : (
          <Delta value={delta}>
            <DeltaIcon filled variant="arrow" />
            <DeltaValue />
          </Delta>
        )}
        <span className="text-pretty text-muted-foreground">{hint}</span>
      </div>
    </DashboardCard>
  );
}

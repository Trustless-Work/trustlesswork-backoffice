import type { DashboardStat } from "@/features/dashboard/types/dashboard.types";
import { StatGrid } from "@/components/dashboard/stat-grid";

type DashboardStatsProps = {
  stats: readonly DashboardStat[];
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  return <StatGrid stats={stats} />;
}

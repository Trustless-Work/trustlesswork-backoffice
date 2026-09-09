"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { RevenueEventsTable } from "@/features/admin-analytics/ui/RevenueEventsTable";
import type { RevenueEvent } from "@/features/admin-analytics/types/analytics.types";

type RevenueLedgerSectionProps = {
  events: readonly RevenueEvent[];
  total: number;
  escrowTotal: number;
  limit: number;
  offset: number;
  isLoading: boolean;
  errorMessage: string | null;
  onPageChange: (offset: number) => void;
};

export const RevenueLedgerSection = ({
  events,
  total,
  escrowTotal,
  limit,
  offset,
  isLoading,
  errorMessage,
  onPageChange,
}: RevenueLedgerSectionProps) => (
  <DashboardCard className="gap-4">
    {errorMessage ? (
      <p className="text-pretty text-muted-foreground text-sm">{errorMessage}</p>
    ) : null}
    <RevenueEventsTable
      escrowTotal={escrowTotal}
      events={events}
      isLoading={isLoading}
      limit={limit}
      offset={offset}
      total={total}
      onPageChange={onPageChange}
    />
  </DashboardCard>
);

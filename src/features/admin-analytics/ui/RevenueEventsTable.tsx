"use client";

import { ReceiptIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NoData } from "@/components/shared/NoData";
import useNetwork from "@/hooks/useNetwork";
import type { RevenueEvent } from "@/features/admin-analytics/types/analytics.types";
import {
  RevenueEventCard,
  RevenueEventRow,
} from "@/features/admin-analytics/ui/revenue/RevenueEventRow";
import { RevenueEventsTableSkeleton } from "@/features/admin-analytics/ui/RevenueEventsTableSkeleton";

type RevenueEventsTableProps = {
  events: readonly RevenueEvent[];
  total: number;
  escrowTotal: number;
  limit: number;
  offset: number;
  isLoading?: boolean;
  onPageChange: (offset: number) => void;
};

export const RevenueEventsTable = ({
  events,
  total,
  escrowTotal,
  limit,
  offset,
  isLoading = false,
  onPageChange,
}: RevenueEventsTableProps) => {
  const { currentNetwork } = useNetwork();
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  if (isLoading) {
    return <RevenueEventsTableSkeleton />;
  }

  if (events.length === 0) {
    return (
      <NoData
        icon={ReceiptIcon}
        title="No revenue events"
        description="No ledger rows match the selected range and filters."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:hidden">
        {events.map((event, index) => (
          <RevenueEventCard
            key={`${event.escrowId}-${event.createdAt}-${index}`}
            event={event}
            network={currentNetwork}
          />
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Escrow</TableHead>
              <TableHead>Escrow type</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead className="text-right">Released</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-right">Tx</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event, index) => (
              <RevenueEventRow
                key={`${event.escrowId}-${event.createdAt}-${index}`}
                event={event}
                index={index}
                network={currentNetwork}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs tabular-nums">
          {total} events · {escrowTotal} escrows · page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={!canPrev}
            size="sm"
            variant="outline"
            onClick={() => onPageChange(Math.max(0, offset - limit))}
          >
            Previous
          </Button>
          <Button
            disabled={!canNext}
            size="sm"
            variant="outline"
            onClick={() => onPageChange(offset + limit)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

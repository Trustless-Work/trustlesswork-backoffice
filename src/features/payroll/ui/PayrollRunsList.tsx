"use client";

import Link from "next/link";
import { WalletIcon } from "lucide-react";
import { NoData } from "@/components/shared/NoData";
import { UsdcAmount } from "@/components/shared/UsdcAmount";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EscrowListItem } from "@/features/escrows/types/escrow.types";
import {
  formatPayrollPeriodLabel,
  parsePayrollPeriod,
} from "@/features/payroll/utils/payroll-naming.helper";

type PayrollRunsListProps = {
  runs: EscrowListItem[];
  isLoading: boolean;
  onCreateRequest: () => void;
};

function getRunLabel(run: EscrowListItem): string {
  const period = parsePayrollPeriod(run.engagementId);
  if (period) {
    return formatPayrollPeriodLabel(period);
  }
  return run.title || run.engagementId || run.contractId;
}

function getFundingBadge(run: EscrowListItem) {
  if (run.balance > 0) {
    return <Badge variant="secondary">Funded</Badge>;
  }
  return <Badge variant="outline">Unfunded</Badge>;
}

const AmountTile = ({
  label,
  amount,
  symbol,
}: {
  label: string;
  amount: number;
  symbol: string;
}) => (
  <div className="rounded-2xl border-2 border-border px-3 py-2.5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <UsdcAmount
      amount={amount}
      symbol={symbol}
      size="lg"
      emphasis
      className="mt-0.5"
    />
  </div>
);

const PayrollRunsListSkeleton = () => (
  <>
    <div className="flex flex-col gap-3 md:hidden">
      {Array.from({ length: 3 }).map((_, index) => (
        <article
          key={index}
          className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-4 w-24" />
        </article>
      ))}
    </div>
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </>
);

export const PayrollRunsList = ({
  runs,
  isLoading,
  onCreateRequest,
}: PayrollRunsListProps) => {
  if (isLoading) {
    return <PayrollRunsListSkeleton />;
  }

  if (runs.length === 0) {
    return (
      <NoData
        icon={WalletIcon}
        title="No payroll runs yet"
        description="Create a quincena multi-release escrow to pay the team."
        actionLabel="New payroll run"
        onAction={onCreateRequest}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {runs.map((run) => (
          <Link
            key={run.contractId}
            href={`/admin/payroll/${run.contractId}`}
            className="block"
          >
            <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-pretty text-base font-semibold tracking-tight">
                  {getRunLabel(run)}
                </h3>
                {getFundingBadge(run)}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <AmountTile
                  label="Total"
                  amount={run.totalAmount ?? 0}
                  symbol={run.assetSymbol}
                />
                <AmountTile
                  label="Balance"
                  amount={run.balance}
                  symbol={run.assetSymbol}
                />
              </div>

              <footer className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                {run.milestoneCount} payments
              </footer>
            </article>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.contractId} className="group">
                <TableCell>
                  <Link
                    href={`/admin/payroll/${run.contractId}`}
                    className="font-medium tracking-tight group-hover:underline"
                  >
                    {getRunLabel(run)}
                  </Link>
                </TableCell>
                <TableCell>
                  <UsdcAmount
                    amount={run.totalAmount ?? 0}
                    symbol={run.assetSymbol}
                    size="sm"
                    emphasis
                  />
                </TableCell>
                <TableCell>
                  <UsdcAmount
                    amount={run.balance}
                    symbol={run.assetSymbol}
                    size="sm"
                  />
                </TableCell>
                <TableCell>{getFundingBadge(run)}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {run.milestoneCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

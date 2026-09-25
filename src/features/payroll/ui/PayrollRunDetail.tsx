"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/shared/Container";
import { DashboardPageHeaderActions } from "@/components/shared/DashboardPageHeaderContext";
import { ResponsiveCopyField } from "@/components/shared/ResponsiveCopyField";
import {
  OverviewStat,
  UsdcAmountStat,
} from "@/components/shared/UsdcAmount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EscrowActionsProvider } from "@/features/escrows/providers/EscrowActionsProvider";
import {
  isStoredMultiReleaseEscrow,
} from "@/features/escrows/types/escrow.types";
import { EscrowDepositsCard } from "@/features/escrows/ui/detail/EscrowDepositsCard";
import { getEscrowDisplayAmount } from "@/features/escrows/utils/escrow-display.helper";
import type { PayrollPaymentTab } from "@/features/payroll/constants/payment-tabs";
import { usePayrollRunDetail } from "@/features/payroll/hooks/usePayrollRuns";
import { PayrollExplorerLinks } from "@/features/payroll/ui/PayrollExplorerLinks";
import { PayrollFundAction } from "@/features/payroll/ui/PayrollFundAction";
import { PayrollMembersPanel } from "@/features/payroll/ui/PayrollMembersPanel";
import { PayrollPayAction } from "@/features/payroll/ui/PayrollPayAction";
import { PayrollShareAction } from "@/features/payroll/ui/PayrollShareAction";
import { mapMilestonesToPayrollRows } from "@/features/payroll/utils/payroll-members.helper";
import {
  buildPayrollTitle,
  formatPayrollPeriodLabel,
  parsePayrollPeriod,
} from "@/features/payroll/utils/payroll-naming.helper";

type PayrollRunDetailProps = {
  contractId: string;
};

const fieldHeightActionClassName =
  "h-full! w-full shrink-0 self-stretch rounded-xl px-4 capitalize sm:w-auto sm:rounded-full sm:px-5";

const OverviewStatSkeleton = () => (
  <div>
    <Skeleton className="h-4 w-16" />
    <Skeleton className="mt-2 h-7 w-28" />
  </div>
);

const PayrollRunDetailSkeleton = () => (
  <div className="flex flex-col gap-6">
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>
      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <OverviewStatSkeleton key={index} />
        ))}
      </dl>
      <div className="mt-6 space-y-2 border-t border-border pt-6">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-full max-w-md flex-1 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
      </div>
    </section>

    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="mt-6 flex flex-col gap-4 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border p-4"
          >
            <Skeleton className="h-5 w-32" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 hidden md:block">
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </section>

    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-4 w-6" />
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </section>
  </div>
);

export const PayrollRunDetail = ({ contractId }: PayrollRunDetailProps) => {
  const { escrow, detail, isResolving, isError } =
    usePayrollRunDetail(contractId);
  const [paymentTab, setPaymentTab] = useState<PayrollPaymentTab>("test");

  if (isResolving) {
    return (
      <Container>
        <PayrollRunDetailSkeleton />
      </Container>
    );
  }

  if (isError || !escrow) {
    return (
      <Container className="flex flex-col items-start gap-4 py-8">
        <p className="text-sm text-muted-foreground">
          Payroll run not found or failed to load.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/payroll">
            <ArrowLeftIcon />
            Back to payroll
          </Link>
        </Button>
      </Container>
    );
  }

  const period = parsePayrollPeriod(escrow.engagementId);
  const title = period ? buildPayrollTitle(period) : escrow.title;
  const periodLabel = period
    ? formatPayrollPeriodLabel(period)
    : escrow.title;
  const total = getEscrowDisplayAmount(escrow);
  const isFunded = escrow.balance > 0;
  const payrollRows = isStoredMultiReleaseEscrow(escrow)
    ? mapMilestonesToPayrollRows(escrow.milestones)
    : [];
  const salaryRows = payrollRows.filter((row) => row.kind === "salary");
  const testRows = payrollRows.filter((row) => row.kind === "test");
  const pendingIndexes = payrollRows
    .filter((row) => !row.paid && row.kind === paymentTab)
    .map((row) => row.index);
  const payAllLabel =
    paymentTab === "test" ? "Pay All Tests" : "Pay All Salaries";
  const activeRows = paymentTab === "test" ? testRows : salaryRows;
  const allActivePaid =
    activeRows.length > 0 && activeRows.every((row) => row.paid);
  const showShare = allActivePaid;
  const shareTotal = activeRows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <EscrowActionsProvider
      contractId={escrow.contractId}
      escrowType={escrow.type}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <DashboardPageHeaderActions>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/payroll">
              <ArrowLeftIcon />
              Back
            </Link>
          </Button>
        </DashboardPageHeaderActions>

        <Container className="flex flex-col gap-6">
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-2xl">
                <h1 className="text-pretty text-2xl font-semibold tracking-tight">
                  {title}
                </h1>
                {periodLabel ? (
                  <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                    {periodLabel}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={isFunded ? "secondary" : "outline"}>
                  {isFunded ? "Funded" : "Unfunded"}
                </Badge>
                <PayrollExplorerLinks contractId={escrow.contractId} />
              </div>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
              <UsdcAmountStat
                label="Total"
                amount={total}
                symbol="USDC"
                size="2xl"
                emphasis
              />
              <UsdcAmountStat
                label="Balance"
                amount={escrow.balance}
                symbol="USDC"
                size="2xl"
                emphasis
              />
              <OverviewStat
                label="Payments"
                value={String(escrow.milestones.length)}
              />
              <OverviewStat
                label="Engagement ID"
                value={escrow.engagementId}
                mono
              />
            </dl>

            <div className="mt-6 space-y-2 border-t border-border pt-6">
              <span className="text-sm text-muted-foreground">Contract ID</span>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
                <ResponsiveCopyField
                  value={escrow.contractId}
                  className="min-w-0 flex-1"
                />
                <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-stretch">
                  {!isFunded && !showShare ? (
                    <PayrollFundAction
                      escrow={escrow}
                      className={fieldHeightActionClassName}
                    />
                  ) : null}
                  {pendingIndexes.length > 0 ? (
                    <PayrollPayAction
                      escrow={escrow}
                      milestoneIndexes={pendingIndexes}
                      label={payAllLabel}
                      variant="outline"
                      className={fieldHeightActionClassName}
                      disabled={!isFunded}
                    />
                  ) : null}
                  {showShare ? (
                    <PayrollShareAction
                      className={fieldHeightActionClassName}
                      shareInput={{
                        periodLabel,
                        totalAmount: shareTotal,
                        memberCount: activeRows.length,
                        contractId: escrow.contractId,
                        engagementId: escrow.engagementId,
                        kind: paymentTab,
                        receivers: activeRows.map((row) => ({
                          name: row.displayName,
                          wallet: row.receiver,
                          amount: row.amount,
                        })),
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <PayrollMembersPanel
            escrow={escrow}
            tab={paymentTab}
            onTabChange={setPaymentTab}
          />
          <EscrowDepositsCard deposits={detail?.deposits ?? []} />
        </Container>
      </div>
    </EscrowActionsProvider>
  );
};

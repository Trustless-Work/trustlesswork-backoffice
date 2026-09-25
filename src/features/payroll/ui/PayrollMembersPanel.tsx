"use client";

import { BanknoteIcon, FlaskConicalIcon, UsersIcon } from "lucide-react";
import { NoData } from "@/components/shared/NoData";
import { RoundedTabs, type TabItem } from "@/components/ui/custom-tab";
import {
  isStoredMultiReleaseEscrow,
  type StoredEscrow,
} from "@/features/escrows/types/escrow.types";
import { getAddressOccurrenceCounts } from "@/features/escrows/utils/escrow-display.helper";
import {
  isPayrollPaymentTab,
  type PayrollPaymentTab,
} from "@/features/payroll/constants/payment-tabs";
import { PayrollMembersList } from "@/features/payroll/ui/PayrollMembersList";
import { mapMilestonesToPayrollRows } from "@/features/payroll/utils/payroll-members.helper";
import { cn } from "@/lib/utils";

type PayrollMembersPanelProps = {
  escrow: StoredEscrow;
  tab: PayrollPaymentTab;
  onTabChange: (tab: PayrollPaymentTab) => void;
};

const PAYMENT_TABS: TabItem[] = [
  { value: "test", label: "Test", icon: <FlaskConicalIcon /> },
  { value: "salary", label: "Salary", icon: <BanknoteIcon /> },
];

function countPaid(rows: { paid: boolean }[]): number {
  return rows.filter((row) => row.paid).length;
}

export const PayrollMembersPanel = ({
  escrow,
  tab,
  onTabChange,
}: PayrollMembersPanelProps) => {
  if (!isStoredMultiReleaseEscrow(escrow)) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <NoData
          icon={UsersIcon}
          title="Invalid payroll contract"
          description="This contract is not a multi-release payroll run."
        />
      </section>
    );
  }

  const rows = mapMilestonesToPayrollRows(escrow.milestones);
  const salaryRows = rows.filter((row) => row.kind === "salary");
  const testRows = rows.filter((row) => row.kind === "test");
  const activeRows = tab === "salary" ? salaryRows : testRows;
  const canPay = escrow.balance > 0;
  const receiverCounts = getAddressOccurrenceCounts([
    { addresses: rows.map((row) => row.receiver) },
  ]);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Team payments
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {countPaid(activeRows)} of {activeRows.length} released in this tab
          </p>
        </div>

        <RoundedTabs
          fullWidth
          items={PAYMENT_TABS}
          value={tab}
          onValueChange={(value) => {
            if (isPayrollPaymentTab(value)) {
              onTabChange(value);
            }
          }}
        />
      </div>

      <div className="relative mt-6">
        <div
          className={cn(
            "transition-opacity duration-200 ease-out",
            tab === "test"
              ? "relative z-10 opacity-100"
              : "pointer-events-none absolute inset-x-0 top-0 z-0 opacity-0",
          )}
          aria-hidden={tab !== "test"}
        >
          <PayrollMembersList
            rows={testRows}
            escrow={escrow}
            canPay={canPay}
            receiverCounts={receiverCounts}
            emptyTitle="No test payments"
            emptyDescription="This payroll run has no test milestones."
          />
        </div>
        <div
          className={cn(
            "transition-opacity duration-200 ease-out",
            tab === "salary"
              ? "relative z-10 opacity-100"
              : "pointer-events-none absolute inset-x-0 top-0 z-0 opacity-0",
          )}
          aria-hidden={tab !== "salary"}
        >
          <PayrollMembersList
            rows={salaryRows}
            escrow={escrow}
            canPay={canPay}
            receiverCounts={receiverCounts}
            emptyTitle="No salary payments"
            emptyDescription="This payroll run has no salary milestones."
          />
        </div>
      </div>
    </section>
  );
};

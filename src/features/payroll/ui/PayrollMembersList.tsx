"use client";

import { UsersIcon } from "lucide-react";
import { NoData } from "@/components/shared/NoData";
import { ResponsiveCopyField } from "@/components/shared/ResponsiveCopyField";
import { UsdcAmount } from "@/components/shared/UsdcAmount";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLinkedAddressHighlight } from "@/features/escrows/hooks/useLinkedAddressHighlight";
import type { StoredEscrow } from "@/features/escrows/types/escrow.types";
import { isSharedEscrowAddress } from "@/features/escrows/utils/escrow-display.helper";
import { PayrollPayAction } from "@/features/payroll/ui/PayrollPayAction";
import {
  getPayrollPayLabel,
  type PayrollMemberRow,
} from "@/features/payroll/utils/payroll-members.helper";

type LinkedAddressProps = ReturnType<
  ReturnType<typeof useLinkedAddressHighlight>["getLinkedAddressProps"]
>;

type PayrollMembersListProps = {
  rows: PayrollMemberRow[];
  escrow: StoredEscrow;
  canPay: boolean;
  receiverCounts: ReadonlyMap<string, number>;
  emptyTitle: string;
  emptyDescription: string;
};

const tableHeadClassName =
  "h-auto px-5 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground";

const tableCellClassName = "px-5 py-5 align-middle";

const StatusBadge = ({ paid }: { paid: boolean }) => (
  <Badge variant={paid ? "secondary" : "outline"}>
    {paid ? "Paid" : "Pending"}
  </Badge>
);

const ReceiverField = ({
  receiver,
  receiverCounts,
  getLinkedAddressProps,
}: {
  receiver: string;
  receiverCounts: ReadonlyMap<string, number>;
  getLinkedAddressProps: (
    address: string,
    isShared: boolean,
  ) => LinkedAddressProps;
}) => (
  <ResponsiveCopyField
    value={receiver}
    compact
    maxVisibleChars={18}
    {...getLinkedAddressProps(
      receiver,
      isSharedEscrowAddress(receiverCounts, receiver),
    )}
  />
);

const MemberCard = ({
  row,
  escrow,
  canPay,
  receiverCounts,
  getLinkedAddressProps,
}: {
  row: PayrollMemberRow;
  escrow: StoredEscrow;
  canPay: boolean;
  receiverCounts: ReadonlyMap<string, number>;
  getLinkedAddressProps: (
    address: string,
    isShared: boolean,
  ) => LinkedAddressProps;
}) => (
  <article className="rounded-2xl border border-border bg-card/60 p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium tracking-tight">{row.displayName}</p>
        {row.email ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {row.email}
          </p>
        ) : null}
      </div>
      <StatusBadge paid={row.paid} />
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Amount</span>
        <UsdcAmount amount={row.amount} symbol="USDC" size="md" emphasis />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs text-muted-foreground">Receiver</span>
        <ReceiverField
          receiver={row.receiver}
          receiverCounts={receiverCounts}
          getLinkedAddressProps={getLinkedAddressProps}
        />
      </div>
    </div>

    {!row.paid ? (
      <div className="mt-4 flex justify-end border-t border-border pt-4">
        <PayrollPayAction
          escrow={escrow}
          milestoneIndexes={[row.index]}
          label={getPayrollPayLabel(row)}
          disabled={!canPay}
        />
      </div>
    ) : null}
  </article>
);

export const PayrollMembersList = ({
  rows,
  escrow,
  canPay,
  receiverCounts,
  emptyTitle,
  emptyDescription,
}: PayrollMembersListProps) => {
  const { getLinkedAddressProps } = useLinkedAddressHighlight();

  if (rows.length === 0) {
    return (
      <NoData
        icon={UsersIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:hidden">
        {rows.map((row) => (
          <MemberCard
            key={row.index}
            row={row}
            escrow={escrow}
            canPay={canPay}
            receiverCounts={receiverCounts}
            getLinkedAddressProps={getLinkedAddressProps}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={tableHeadClassName}>Member</TableHead>
              <TableHead className={tableHeadClassName}>Amount</TableHead>
              <TableHead className={tableHeadClassName}>Receiver</TableHead>
              <TableHead className={tableHeadClassName}>Status</TableHead>
              <TableHead className={`${tableHeadClassName} text-right`}>
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.index}>
                <TableCell className={tableCellClassName}>
                  <div className="flex flex-col">
                    <span className="font-medium tracking-tight">
                      {row.displayName}
                    </span>
                    {row.email ? (
                      <span className="text-xs text-muted-foreground">
                        {row.email}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className={tableCellClassName}>
                  <UsdcAmount
                    amount={row.amount}
                    symbol="USDC"
                    size="sm"
                    emphasis
                  />
                </TableCell>
                <TableCell
                  className={`${tableCellClassName} min-w-[190px] whitespace-normal`}
                >
                  <ReceiverField
                    receiver={row.receiver}
                    receiverCounts={receiverCounts}
                    getLinkedAddressProps={getLinkedAddressProps}
                  />
                </TableCell>
                <TableCell className={tableCellClassName}>
                  <StatusBadge paid={row.paid} />
                </TableCell>
                <TableCell className={`${tableCellClassName} text-right`}>
                  {!row.paid ? (
                    <PayrollPayAction
                      escrow={escrow}
                      milestoneIndexes={[row.index]}
                      label={getPayrollPayLabel(row)}
                      disabled={!canPay}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

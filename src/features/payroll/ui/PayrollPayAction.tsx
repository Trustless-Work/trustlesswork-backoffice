"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/features/escrows/ui/actions/ConfirmActionDialog";
import { useEscrowActionsContext } from "@/features/escrows/providers/EscrowActionsProvider";
import {
  isStoredMultiReleaseEscrow,
  type StoredEscrow,
} from "@/features/escrows/types/escrow.types";

type PayrollPayActionProps = {
  escrow: StoredEscrow;
  milestoneIndexes: number[];
  label: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm";
  className?: string;
  disabled?: boolean;
};

export const PayrollPayAction = ({
  escrow,
  milestoneIndexes,
  label,
  variant = "default",
  size = "sm",
  className,
  disabled = false,
}: PayrollPayActionProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { approveAndRelease, loading, walletAddress } =
    useEscrowActionsContext();

  if (!isStoredMultiReleaseEscrow(escrow) || milestoneIndexes.length === 0) {
    return null;
  }

  const isBatch = milestoneIndexes.length > 1;
  const usesCustomHeight = Boolean(className);

  const handleConfirm = async () => {
    if (!walletAddress) {
      return;
    }

    const result = await approveAndRelease({
      contractId: escrow.contractId,
      signer: walletAddress,
      milestoneIndexes,
    });

    if (result) {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size={usesCustomHeight ? "default" : size}
        variant={variant}
        className={className}
        disabled={disabled || loading || !walletAddress}
        onClick={() => setConfirmOpen(true)}
      >
        {label}
      </Button>

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isBatch ? "Pay all pending?" : "Release payment?"}
        description={
          isBatch
            ? "This approves and releases every pending payment in one transaction."
            : "This approves and releases this payment. The action is irreversible."
        }
        confirmLabel={isBatch ? "Pay all" : "Pay"}
        loading={loading}
        onConfirm={handleConfirm}
      />
    </>
  );
};

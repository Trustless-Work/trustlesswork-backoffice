"use client";

import { useState } from "react";
import { PayoutPreferenceDialog } from "@/features/cctp-bridge/ui/PayoutPreferenceDialog";
import type {
  EscrowActionProps,
  EscrowMilestoneActionProps,
} from "@/features/escrows/types/escrow-action.types";
import { ActionTrigger } from "@/features/escrows/ui/actions/ActionTrigger";

type PayoutPreferenceActionProps = EscrowActionProps | EscrowMilestoneActionProps;

function hasMilestoneIndex(
  props: PayoutPreferenceActionProps,
): props is EscrowMilestoneActionProps {
  return "milestoneIndexes" in props;
}

/** Receiver-only entry point into the CCTP payout flow. Thin wrapper (gated by the call site) that opens `PayoutPreferenceDialog`. */
export const PayoutPreferenceAction = (props: PayoutPreferenceActionProps) => {
  const { escrow, triggerVariant, icon, triggerMode = "button" } = props;
  const milestoneIndex = hasMilestoneIndex(props)
    ? props.milestoneIndexes[0]
    : undefined;
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionTrigger
        label="Payout Preference"
        triggerMode={triggerMode}
        triggerVariant={triggerVariant}
        icon={icon}
        onActivate={() => setOpen(true)}
      />

      <PayoutPreferenceDialog
        open={open}
        onOpenChange={setOpen}
        escrowKind={escrow.type}
        contractId={escrow.contractId}
        milestoneIndex={milestoneIndex}
      />
    </>
  );
};

"use client";

import {
  BadgeCheck,
  CircleDollarSign,
  Gavel,
  Globe,
  ListChecks,
  MoreHorizontal,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEscrowActionPolicy } from "@/features/escrows/hooks/useEscrowActionPolicy";
import type { StoredEscrow } from "@/features/escrows/types/escrow.types";
import { ApproveAndReleaseAction } from "@/features/escrows/ui/actions/ApproveAndReleaseAction";
import { ApproveMilestoneAction } from "@/features/escrows/ui/actions/ApproveMilestoneAction";
import { ChangeMilestoneStatusAction } from "@/features/escrows/ui/actions/ChangeMilestoneStatusAction";
import { PayoutPreferenceAction } from "@/features/escrows/ui/actions/PayoutPreferenceAction";
import { ReleaseFundsAction } from "@/features/escrows/ui/actions/ReleaseFundsAction";
import { ResolveDisputeAction } from "@/features/escrows/ui/actions/ResolveDisputeAction";
import { StartDisputeAction } from "@/features/escrows/ui/actions/StartDisputeAction";

type MilestoneActionsMenuProps = {
  escrow: StoredEscrow;
  milestoneIndex: number;
};

export const MilestoneActionsMenu = ({
  escrow,
  milestoneIndex,
}: MilestoneActionsMenuProps) => {
  const policy = useEscrowActionPolicy(escrow);
  const milestoneProps = {
    escrow,
    milestoneIndexes: [milestoneIndex],
    triggerMode: "menu-item" as const,
  };

  const showApprove = policy.canApproveMilestone(milestoneIndex);
  const showChangeStatus = policy.canChangeMilestoneStatus(milestoneIndex);
  const showApproveAndRelease =
    policy.canApproveAndReleaseMilestone(milestoneIndex);
  const showRelease = policy.canReleaseMilestone(milestoneIndex);
  const showDispute = policy.canDisputeMilestone(milestoneIndex);
  const showResolve = policy.canResolveMilestoneDispute(milestoneIndex);
  const showPayoutPreference =
    policy.canManagePayoutPreference(milestoneIndex);

  const hasPrimaryActions = showApprove || showChangeStatus;
  const hasReleaseActions = showApproveAndRelease || showRelease;
  const hasDisputeActions = showDispute || showResolve;
  const hasPayoutActions = showPayoutPreference;
  const hasAnyActions =
    hasPrimaryActions ||
    hasReleaseActions ||
    hasDisputeActions ||
    hasPayoutActions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 cursor-pointer rounded-full"
          aria-label={`Milestone ${milestoneIndex + 1} actions`}
          disabled={!hasAnyActions}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      {hasAnyActions ? (
        <DropdownMenuContent align="end" className="w-60 p-1.5">
          <DropdownMenuLabel>Milestone {milestoneIndex + 1}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {showApprove ? (
            <ApproveMilestoneAction {...milestoneProps} icon={BadgeCheck} />
          ) : null}
          {showChangeStatus ? (
            <ChangeMilestoneStatusAction
              {...milestoneProps}
              icon={ListChecks}
            />
          ) : null}

          {hasReleaseActions ? (
            <>
              {hasPrimaryActions ? <DropdownMenuSeparator /> : null}
              {showApproveAndRelease ? (
                <ApproveAndReleaseAction
                  {...milestoneProps}
                  triggerVariant="primary"
                  icon={Zap}
                />
              ) : null}
              {showRelease ? (
                <ReleaseFundsAction
                  {...milestoneProps}
                  triggerVariant="primary"
                  icon={CircleDollarSign}
                />
              ) : null}
            </>
          ) : null}

          {hasDisputeActions ? (
            <>
              {hasPrimaryActions || hasReleaseActions ? (
                <DropdownMenuSeparator />
              ) : null}
              {showDispute ? (
                <StartDisputeAction
                  {...milestoneProps}
                  triggerVariant="danger"
                  icon={ShieldAlert}
                />
              ) : null}
              {showResolve ? (
                <ResolveDisputeAction {...milestoneProps} icon={Gavel} />
              ) : null}
            </>
          ) : null}

          {hasPayoutActions ? (
            <>
              {hasPrimaryActions || hasReleaseActions || hasDisputeActions ? (
                <DropdownMenuSeparator />
              ) : null}
              {showPayoutPreference ? (
                <PayoutPreferenceAction {...milestoneProps} icon={Globe} />
              ) : null}
            </>
          ) : null}
        </DropdownMenuContent>
      ) : null}
    </DropdownMenu>
  );
};

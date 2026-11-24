import type { EscrowRoleContext } from "@/features/escrows/domain/escrow-role-context";
import {
  isStoredSingleReleaseEscrow,
  type StoredEscrow,
} from "@/features/escrows/types/escrow.types";
import {
  hasApproverAlreadyApproved,
  isMilestoneApproved,
  isMilestoneDisputed,
  isMilestoneReleased,
  isMilestoneTerminal,
} from "@/features/escrows/utils/escrow-milestone.helper";

export abstract class EscrowActionPolicy {
  protected constructor(
    protected readonly escrow: StoredEscrow,
    protected readonly roles: EscrowRoleContext,
  ) {}

  canFund(): boolean {
    return this.roles.isConnected;
  }

  abstract canUpdate(): boolean;

  abstract canManageMilestones(): boolean;

  canEditExistingMilestones(): boolean {
    return this.escrow.balance <= 0;
  }

  abstract canWithdrawRemainingFunds(): boolean;

  canChangeMilestoneStatus(milestoneIndex: number): boolean {
    if (!this.roles.isServiceProvider()) {
      return false;
    }

    return this.getMilestone(milestoneIndex) !== null;
  }

  canApproveMilestone(milestoneIndex: number): boolean {
    if (!this.roles.isApprover() || !this.roles.address) {
      return false;
    }

    const milestone = this.getMilestone(milestoneIndex);
    if (!milestone) {
      return false;
    }

    if (isMilestoneReleased(milestone) || isMilestoneDisputed(milestone)) {
      return false;
    }

    if (isMilestoneApproved(milestone)) {
      return false;
    }

    return !hasApproverAlreadyApproved(milestone, this.roles.address);
  }

  abstract canReleaseEscrow(): boolean;

  abstract canDisputeEscrow(): boolean;

  abstract canResolveEscrowDispute(): boolean;

  abstract canReleaseMilestone(milestoneIndex: number): boolean;

  abstract canApproveAndReleaseMilestone(milestoneIndex: number): boolean;

  abstract canDisputeMilestone(milestoneIndex: number): boolean;

  abstract canResolveMilestoneDispute(milestoneIndex: number): boolean;

  /**
   * Whether the wallet can manage the CCTP payout preference for this escrow
   * (omit `milestoneIndex`) or milestone (pass it). Receiver-only, and hidden
   * once released or resolved (the payout can no longer change).
   */
  canManagePayoutPreference(milestoneIndex?: number): boolean {
    if (milestoneIndex === undefined) {
      if (!this.roles.isEscrowReceiver()) {
        return false;
      }

      return !this.isEscrowReleasedOrResolved();
    }

    if (!this.roles.isMilestoneReceiver(milestoneIndex)) {
      return false;
    }

    const milestone = this.getMilestone(milestoneIndex);
    return milestone !== null && !isMilestoneTerminal(milestone);
  }

  protected getMilestone(milestoneIndex: number) {
    return this.escrow.milestones[milestoneIndex] ?? null;
  }

  /** Single-release only: released or its dispute is resolved (terminal). */
  private isEscrowReleasedOrResolved(): boolean {
    if (!isStoredSingleReleaseEscrow(this.escrow)) {
      return false;
    }

    return (
      this.escrow.released === true || this.escrow.dispute?.resolved === true
    );
  }

  protected hasPositiveBalance(): boolean {
    return this.escrow.balance > 0;
  }

  protected isUnfunded(): boolean {
    return this.escrow.balance <= 0;
  }
}

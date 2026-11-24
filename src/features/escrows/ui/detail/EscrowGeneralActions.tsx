"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Banknote,
  ChevronDown,
  CircleDollarSign,
  Coins,
  Gavel,
  Globe,
  ListTree,
  ShieldAlert,
  Wallet,
  Wrench,
} from "lucide-react";
import { useEscrowActionPolicy } from "@/features/escrows/hooks/useEscrowActionPolicy";
import type { StoredEscrow } from "@/features/escrows/types/escrow.types";
import { FundEscrowAction } from "@/features/escrows/ui/actions/FundEscrowAction";
import { ManageMilestonesAction } from "@/features/escrows/ui/actions/ManageMilestonesAction";
import { PayoutPreferenceAction } from "@/features/escrows/ui/actions/PayoutPreferenceAction";
import { ReleaseFundsAction } from "@/features/escrows/ui/actions/ReleaseFundsAction";
import { ResolveDisputeAction } from "@/features/escrows/ui/actions/ResolveDisputeAction";
import { StartDisputeAction } from "@/features/escrows/ui/actions/StartDisputeAction";
import { UpdateEscrowAction } from "@/features/escrows/ui/actions/UpdateEscrowAction";
import { WithdrawFundsAction } from "@/features/escrows/ui/actions/WithdrawFundsAction";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type EscrowGeneralActionsProps = {
  escrow: StoredEscrow;
};

type ActionGroupProps = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  open: boolean;
  onToggle: (id: string) => void;
};

const ActionGroup = ({
  id,
  title,
  description,
  children,
  open,
  onToggle,
}: ActionGroupProps) => {
  const contentId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-2xl border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => onToggle(id)}
        className={cn(
          "flex w-full cursor-pointer items-start justify-between gap-3 p-4 text-left",
          "transition-colors duration-200 ease-out hover:bg-muted/40",
          open && "bg-muted/25",
        )}
      >
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <motion.span
          aria-hidden="true"
          className="mt-0.5 inline-flex size-4 shrink-0 text-muted-foreground"
          animate={{ rotate: open ? 180 : 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.35, ease: EASE_OUT }
          }
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={contentId}
            key={`${id}-content`}
            initial={
              reduceMotion
                ? false
                : { height: 0, opacity: 0 }
            }
            animate={{
              height: "auto",
              opacity: 1,
              transition: reduceMotion
                ? { duration: 0 }
                : {
                    height: { duration: 0.38, ease: EASE_OUT },
                    opacity: { duration: 0.28, ease: EASE_OUT, delay: 0.04 },
                  },
            }}
            exit={
              reduceMotion
                ? undefined
                : {
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.28, ease: "easeIn" },
                      opacity: { duration: 0.18, ease: "easeIn" },
                    },
                  }
            }
            className="overflow-hidden"
          >
            <motion.div
              className="flex flex-col gap-2 border-t px-3 py-3"
              initial={reduceMotion ? false : { y: -6, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.3, ease: EASE_OUT, delay: 0.06 },
              }}
              exit={
                reduceMotion
                  ? undefined
                  : {
                      y: -4,
                      opacity: 0,
                      transition: { duration: 0.14, ease: "easeIn" },
                    }
              }
            >
              {children}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export const EscrowGeneralActions = ({ escrow }: EscrowGeneralActionsProps) => {
  const policy = useEscrowActionPolicy(escrow);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const handleToggleGroup = (groupId: string) => {
    setOpenGroup((current) => (current === groupId ? null : groupId));
  };

  const showFund = policy.canFund();
  const showWithdraw = policy.canWithdrawRemainingFunds();
  const showUpdate = policy.canUpdate();
  const showManageMilestones = policy.canManageMilestones();
  const showRelease = policy.canReleaseEscrow();
  const showDispute = policy.canDisputeEscrow();
  const showResolve = policy.canResolveEscrowDispute();
  // No milestoneIndex here: this is escrow-wide, single-release only —
  // resolves to false on multi-release, where it's per-milestone instead
  // (see MilestoneActionsMenu).
  const showPayoutPreference = policy.canManagePayoutPreference();

  const hasFundingGroup = showFund || showWithdraw;
  const hasConfigurationGroup = showUpdate || showManageMilestones;
  const hasReleasesGroup = showRelease || showDispute || showResolve;
  const hasPayoutGroup = showPayoutPreference;

  return (
    <aside className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-foreground text-background">
          <Coins className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Actions</h2>
          <p className="text-sm text-muted-foreground">
            Escrow-level operations.
          </p>
        </div>
      </div>

      {hasFundingGroup ? (
        <ActionGroup
          id="funding"
          title="Funding"
          description="Add or recover funds held in the escrow."
          open={openGroup === "funding"}
          onToggle={handleToggleGroup}
        >
          {showFund ? (
            <FundEscrowAction escrow={escrow} icon={Wallet} />
          ) : null}
          {showWithdraw ? (
            <WithdrawFundsAction escrow={escrow} icon={Banknote} />
          ) : null}
        </ActionGroup>
      ) : null}

      {hasConfigurationGroup ? (
        <ActionGroup
          id="configuration"
          title="Configuration"
          description="Update escrow details or manage milestones."
          open={openGroup === "configuration"}
          onToggle={handleToggleGroup}
        >
          {showUpdate ? (
            <UpdateEscrowAction escrow={escrow} icon={Wrench} />
          ) : null}
          {showManageMilestones ? (
            <ManageMilestonesAction escrow={escrow} icon={ListTree} />
          ) : null}
        </ActionGroup>
      ) : null}

      {hasReleasesGroup ? (
        <ActionGroup
          id="releases-disputes"
          title="Releases & Disputes"
          description="Release funds or manage disputes for this escrow."
          open={openGroup === "releases-disputes"}
          onToggle={handleToggleGroup}
        >
          {showRelease ? (
            <ReleaseFundsAction
              escrow={escrow}
              triggerVariant="primary"
              icon={CircleDollarSign}
            />
          ) : null}
          {showDispute ? (
            <StartDisputeAction
              escrow={escrow}
              triggerVariant="danger"
              icon={ShieldAlert}
            />
          ) : null}
          {showResolve ? (
            <ResolveDisputeAction escrow={escrow} icon={Gavel} />
          ) : null}
        </ActionGroup>
      ) : null}

      {hasPayoutGroup ? (
        <ActionGroup
          id="payout"
          title="Payout Preference"
          description="Choose how you receive funds when this escrow releases."
          open={openGroup === "payout"}
          onToggle={handleToggleGroup}
        >
          {showPayoutPreference ? (
            <PayoutPreferenceAction
              escrow={escrow}
              triggerVariant="secondary"
              icon={Globe}
            />
          ) : null}
        </ActionGroup>
      ) : null}
    </aside>
  );
};

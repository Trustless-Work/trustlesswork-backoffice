"use client";

import type { MultiReleaseMilestone } from "@trustless-work/escrow";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { UsdcAmount } from "@/components/shared/UsdcAmount";
import type { EscrowListItem } from "@/features/escrows/types/escrow.types";
import { isStoredMultiReleaseEscrow } from "@/features/escrows/types/escrow.types";
import {
  EscrowCardStatusBadge,
  EscrowTypeBadge,
} from "@/features/escrows/ui/EscrowStatusBadge";
import { MilestoneFlagsBadges } from "@/features/escrows/ui/MilestoneFlagsBadges";
import {
  getEscrowAssetSymbol,
  isEscrowDisputed,
  isEscrowReleased,
} from "@/features/escrows/utils/escrow-display.helper";
import { getMilestoneStatusText } from "@/features/escrows/utils/escrow-milestone.helper";
import { formatIsoDateTimeCompact } from "@/helpers/format.helper";
import { truncateStellarAddress } from "@/helpers/stellar.helper";

type EscrowCardStatus = "active" | "released" | "disputed";

type EscrowCardProps = {
  item: EscrowListItem;
};

function getEscrowCardStatus(item: EscrowListItem): EscrowCardStatus {
  if (item.status === "disputed" || isEscrowDisputed(item.stored)) {
    return "disputed";
  }

  if (item.status === "released" || isEscrowReleased(item.stored)) {
    return "released";
  }

  return "active";
}

export const EscrowCard = ({ item }: EscrowCardProps) => {
  const escrow = item.stored;
  const status = getEscrowCardStatus(item);
  const amount = item.amount;
  const currency = item.assetSymbol || getEscrowAssetSymbol(escrow);
  const isMulti = isStoredMultiReleaseEscrow(escrow);
  const milestones = escrow.milestones;
  const visibleMilestones = milestones.slice(0, 3);
  const remaining = milestones.length - visibleMilestones.length;

  return (
    <Link
      href={`/dashboard/escrows/${item.contractId}`}
      className="block h-full min-h-0"
    >
      <article className="flex h-full min-h-[20rem] flex-col overflow-hidden rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <EscrowTypeBadge escrow={escrow} />
              <Badge
                variant="secondary"
                className="font-mono font-normal uppercase"
              >
                {truncateStellarAddress(item.contractId, 8, 6)}
              </Badge>
            </div>
            <h3 className="truncate text-base font-semibold leading-tight text-balance">
              {item.title}
            </h3>
          </div>
          <EscrowCardStatusBadge status={status} />
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Amount</p>
            {amount === null ? (
              <p className="mt-0.5 text-lg font-semibold text-muted-foreground">
                Pending
              </p>
            ) : (
              <UsdcAmount
                amount={amount}
                symbol={currency}
                size="lg"
                emphasis
                className="mt-0.5"
              />
            )}
          </div>
          <div className="rounded-2xl border-2 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Balance</p>
            <UsdcAmount
              amount={item.balance}
              symbol={currency}
              size="lg"
              emphasis
              className="mt-0.5"
            />
          </div>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 pb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Milestones
          </p>
          {milestones.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              No milestones yet
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {visibleMilestones.map((milestone, index) => {
                  const statusText = getMilestoneStatusText(milestone);
                  const multiMilestone = isMulti
                    ? (milestone as MultiReleaseMilestone)
                    : null;

                  return (
                    <li
                      key={`${escrow.contractId}-${index}`}
                      className="flex min-h-8 items-center justify-between gap-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm leading-5">
                        {milestone.description || `Milestone ${index + 1}`}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {statusText ? (
                          <Badge
                            variant="secondary"
                            className="max-w-24 truncate font-normal normal-case"
                            title={statusText}
                          >
                            {statusText}
                          </Badge>
                        ) : null}
                        <MilestoneFlagsBadges milestone={milestone} hideEmpty />
                        {typeof multiMilestone?.amount === "number" ? (
                          <UsdcAmount
                            amount={multiMilestone.amount}
                            symbol={currency}
                            size="sm"
                          />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {remaining > 0 ? (
                <p className="text-xs font-medium text-muted-foreground">
                  +{remaining} more milestone{remaining > 1 ? "s" : ""}
                </p>
              ) : null}
            </>
          )}
        </div>

        <footer className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
          <time
            dateTime={item.createdAt}
            className="text-xs text-muted-foreground tabular-nums"
          >
            {formatIsoDateTimeCompact(item.createdAt)}
          </time>
        </footer>
      </article>
    </Link>
  );
};

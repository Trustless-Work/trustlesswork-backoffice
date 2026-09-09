"use client";

import { createElement } from "react";
import Link from "next/link";
import { ExternalLinkIcon, InboxIcon } from "lucide-react";
import { NoData } from "@/components/shared/NoData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getEscrowEventIcon,
  getEscrowEventLabel,
} from "@/features/escrows/utils/escrow-event-display.helper";
import {
  getStellarExpertAccountUrl,
  getStellarExpertTransactionUrl,
} from "@/helpers/escrow-explorer.helper";
import { truncateStellarAddress } from "@/helpers/stellar.helper";
import useNetwork from "@/hooks/useNetwork";
import type { EscrowEvent } from "@trustless-work/escrow";

type EscrowEventsCardProps = {
  events: readonly EscrowEvent[];
};

function formatEventDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type EscrowEventIconProps = {
  kind: string;
  className?: string;
};

const EscrowEventIcon = ({ kind, className }: EscrowEventIconProps) =>
  createElement(getEscrowEventIcon(kind), { className });

const EventRow = ({ event }: { event: EscrowEvent }) => {
  const { currentNetwork } = useNetwork();
  const txUrl = event.txHash
    ? getStellarExpertTransactionUrl(currentNetwork, event.txHash)
    : null;
  const actorUrl = event.actor
    ? getStellarExpertAccountUrl(currentNetwork, event.actor)
    : null;

  return (
    <li className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card">
            <EscrowEventIcon kind={event.kind} className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold tracking-tight">
                {getEscrowEventLabel(event.kind)}
              </p>
              <Badge variant="secondary" className="font-mono text-[10px]">
                #{event.ledgerSeq}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatEventDate(event.ledgerClosedAt)}
            </p>
            {actorUrl && event.actor ? (
              <Link
                href={actorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
              >
                {truncateStellarAddress(event.actor)}
                <ExternalLinkIcon className="size-3" />
              </Link>
            ) : null}
          </div>
        </div>
        {txUrl ? (
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View transaction on Stellar Expert"
            >
              <ExternalLinkIcon className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </li>
  );
};

export const EscrowEventsCard = ({ events }: EscrowEventsCardProps) => (
  <section className="flex min-h-0 flex-col rounded-3xl border border-border bg-card p-6 sm:p-8">
    <div className="flex items-baseline justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Events</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          On-chain activity for this escrow.
        </p>
      </div>
      <span className="text-sm text-muted-foreground">{events.length}</span>
    </div>

    <div className="mt-6 flex min-h-0 flex-1 flex-col">
      {events.length === 0 ? (
        <NoData
          icon={InboxIcon}
          title="No events yet"
          description="Escrow events will appear here after on-chain activity."
        />
      ) : (
        <ul className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {events.map((event, index) => (
            <EventRow
              key={`${event.txHash ?? event.ledgerSeq}-${event.kind}-${index}`}
              event={event}
            />
          ))}
        </ul>
      )}
    </div>
  </section>
);

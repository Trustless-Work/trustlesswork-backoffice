"use client";

import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { formatIsoDateTime } from "@/helpers/format.helper";
import {
  getStellarExpertTransactionUrl,
  getTrustlessWorkViewerUrl,
} from "@/helpers/escrow-explorer.helper";
import type { NetworkType } from "@/types/network.entity";
import type {
  RevenueEvent,
  RevenueEventType,
} from "@/features/admin-analytics/types/analytics.types";
import { RevenueAssetAmount } from "@/features/admin-analytics/ui/RevenueAssetAmount";
import { AnalyticsEscrowTypeBadge } from "@/features/admin-analytics/ui/escrows/AnalyticsEscrowTypeBadge";
import {
  formatEventTypeLabel,
  formatOrganizationName,
} from "@/features/admin-analytics/utils/revenue.util";
import { cn } from "@/lib/utils";

export function truncateId(value: string): string {
  if (value.length <= 12) {
    return value;
  }
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function eventRowKey(event: RevenueEvent, index: number): string {
  return `${event.escrowId}-${event.createdAt}-${index}`;
}

function revenueEventTypeBadgeVariant(
  eventType: RevenueEventType,
): VariantProps<typeof badgeVariants>["variant"] {
  return eventType === "release" ? "success" : "secondary";
}

export const RevenueEventTypeBadge = ({
  eventType,
}: {
  eventType: RevenueEventType;
}) => (
  <Badge variant={revenueEventTypeBadgeVariant(eventType)}>
    {formatEventTypeLabel(eventType)}
  </Badge>
);

const ExplorerLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    className="text-primary text-xs hover:underline"
    href={href}
    rel="noopener noreferrer"
    target="_blank"
  >
    {label}
  </Link>
);

export const RevenueEventCard = ({
  event,
  network,
}: {
  event: RevenueEvent;
  network: NetworkType;
}) => (
  <Card className={cn(!event.attributesRevenue && "opacity-60")}>
    <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
      <div className="min-w-0 space-y-1">
        <CardTitle className="truncate font-mono text-sm">
          <ExplorerLink
            href={getTrustlessWorkViewerUrl(network, event.escrowId)}
            label={truncateId(event.escrowId)}
          />
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          {formatIsoDateTime(event.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <AnalyticsEscrowTypeBadge type={event.type} />
        <RevenueEventTypeBadge eventType={event.eventType} />
      </div>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">Organization</span>
        <span className="text-sm">
          {formatOrganizationName(event.organization)}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">Engagement</span>
        <span className="text-sm">{event.engagementId ?? "—"}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">Released</span>
        <RevenueAssetAmount amount={event.amount} asset={event.asset} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">Fee</span>
        <RevenueAssetAmount amount={event.feeAmount} asset={event.asset} />
      </div>
      {event.txHash ? (
        <div className="col-span-2 flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Transaction</span>
          <ExplorerLink
            href={getStellarExpertTransactionUrl(network, event.txHash)}
            label="View on Stellar Expert"
          />
        </div>
      ) : null}
    </CardContent>
  </Card>
);

export const RevenueEventRow = ({
  event,
  network,
  index,
}: {
  event: RevenueEvent;
  network: NetworkType;
  index: number;
}) => (
  <TableRow
    key={eventRowKey(event, index)}
    className={cn(!event.attributesRevenue && "opacity-60")}
  >
    <TableCell className="whitespace-nowrap tabular-nums">
      {formatIsoDateTime(event.createdAt)}
    </TableCell>
    <TableCell className="font-mono text-xs">
      <ExplorerLink
        href={getTrustlessWorkViewerUrl(network, event.escrowId)}
        label={truncateId(event.escrowId)}
      />
    </TableCell>
    <TableCell>
      <AnalyticsEscrowTypeBadge type={event.type} />
    </TableCell>
    <TableCell>
      <RevenueEventTypeBadge eventType={event.eventType} />
    </TableCell>
    <TableCell>{formatOrganizationName(event.organization)}</TableCell>
    <TableCell className="text-right">
      <RevenueAssetAmount
        align="right"
        amount={event.amount}
        asset={event.asset}
      />
    </TableCell>
    <TableCell className="text-right">
      <RevenueAssetAmount
        align="right"
        amount={event.feeAmount}
        asset={event.asset}
      />
    </TableCell>
    <TableCell className="text-right">
      {event.txHash ? (
        <ExplorerLink
          href={getStellarExpertTransactionUrl(network, event.txHash)}
          label="View"
        />
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      )}
    </TableCell>
  </TableRow>
);

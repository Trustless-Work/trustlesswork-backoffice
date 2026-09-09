"use client";

import Link from "next/link";
import { ChevronRightIcon, TrophyIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NoData } from "@/components/shared/NoData";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import useNetwork from "@/hooks/useNetwork";
import { formatIsoDateTime } from "@/helpers/format.helper";
import { getTrustlessWorkViewerUrl } from "@/helpers/escrow-explorer.helper";
import type {
  EscrowsTopBy,
  EscrowsTopResponse,
} from "@/features/admin-analytics/types/analytics-v2.types";
import { useEscrowsTop } from "@/features/admin-analytics/hooks/useAdminAnalytics";
import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import { RevenueAssetAmount } from "@/features/admin-analytics/ui/RevenueAssetAmount";
import { AnalyticsEscrowTypeBadge } from "@/features/admin-analytics/ui/escrows/AnalyticsEscrowTypeBadge";
import {
  formatOrganizationName,
  isUsdcRevenueAsset,
  resolveAssetSymbol,
} from "@/features/admin-analytics/utils/revenue.util";
import { truncateId } from "@/features/admin-analytics/ui/revenue/RevenueEventRow";
import type { NetworkType } from "@/types/network.entity";

type TopEscrowsByAsset = EscrowsTopResponse["data"][number];

type TopEscrowsBoardProps = {
  range: AnalyticsRange;
  by: EscrowsTopBy;
};

type TopEscrowsAssetSectionProps = {
  board: TopEscrowsByAsset;
  by: EscrowsTopBy;
  metricLabel: string;
  network: NetworkType;
};

const TopEscrowsAssetSection = ({
  board,
  by,
  metricLabel,
  network,
}: TopEscrowsAssetSectionProps) => {
  const symbol = resolveAssetSymbol(board.asset);
  const defaultOpen = isUsdcRevenueAsset(board.asset);

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="group/collapsible flex flex-col gap-3"
    >
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50">
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]/collapsible:rotate-90" />
        <h3 className="font-medium text-sm">
          {symbol}
          {!board.asset.resolved ? " *" : ""}
        </h3>
        <span className="text-muted-foreground text-xs tabular-nums">
          {board.escrows.length}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:hidden">
          {board.escrows.map((escrow) => {
            const metricAmount =
              by === "amount" ? escrow.amount : escrow.feeAmount;

            return (
              <Card key={escrow.escrowId}>
                <CardHeader className="pb-3">
                  <CardTitle className="font-mono text-sm">
                    <Link
                      className="text-primary hover:underline"
                      href={getTrustlessWorkViewerUrl(network, escrow.escrowId)}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {truncateId(escrow.escrowId)}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Organization
                    </span>
                    <p className="text-sm">
                      {formatOrganizationName(escrow.organization)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Type</span>
                    <div className="pt-0.5">
                      <AnalyticsEscrowTypeBadge type={escrow.type} />
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      {metricLabel}
                    </span>
                    {metricAmount ? (
                      <RevenueAssetAmount
                        amount={metricAmount}
                        asset={board.asset}
                      />
                    ) : (
                      <p className="text-sm">—</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escrow</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">{metricLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {board.escrows.map((escrow) => {
                const metricAmount =
                  by === "amount" ? escrow.amount : escrow.feeAmount;

                return (
                  <TableRow key={escrow.escrowId}>
                    <TableCell className="font-mono text-xs">
                      <Link
                        className="text-primary hover:underline"
                        href={getTrustlessWorkViewerUrl(
                          network,
                          escrow.escrowId,
                        )}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {truncateId(escrow.escrowId)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {formatOrganizationName(escrow.organization)}
                    </TableCell>
                    <TableCell>
                      <AnalyticsEscrowTypeBadge type={escrow.type} />
                    </TableCell>
                    <TableCell>
                      {escrow.status ? (
                        <Badge variant="outline">{escrow.status}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {escrow.createdAt
                        ? formatIsoDateTime(escrow.createdAt)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {metricAmount ? (
                        <RevenueAssetAmount
                          align="right"
                          amount={metricAmount}
                          asset={board.asset}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const TopEscrowsBoard = ({ range, by }: TopEscrowsBoardProps) => {
  const { currentNetwork } = useNetwork();
  const query = useEscrowsTop(range, by);

  if (query.isPending) {
    return null;
  }

  const boards = query.data?.data ?? [];
  const metricLabel = by === "amount" ? "Amount" : "Fee";

  return (
    <DashboardCard className="gap-4">
      {query.errorMessage ? (
        <p className="text-pretty text-muted-foreground text-sm">
          {query.errorMessage}
        </p>
      ) : boards.length === 0 ? (
        <NoData
          icon={TrophyIcon}
          title="No top escrows"
          description="No escrows match the selected range."
        />
      ) : (
        boards.map((board) => (
          <TopEscrowsAssetSection
            key={board.asset.address}
            board={board}
            by={by}
            metricLabel={metricLabel}
            network={currentNetwork}
          />
        ))
      )}
    </DashboardCard>
  );
};

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashboardNextRelease } from "@/features/dashboard/types/dashboard.types";
import {
  DASHBOARD_LOCALE,
  formatFullCurrency,
  parseIsoCalendarDate,
} from "@/helpers/chart-format.helper";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";

function formatLongUsDate(isoDate: string) {
  const date = parseIsoCalendarDate(isoDate);
  return date.toLocaleDateString(DASHBOARD_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <div className="min-w-0 text-right text-foreground">{children}</div>
    </div>
  );
}

type FedIncomeTaxProps = {
  nextRelease: DashboardNextRelease;
  platformFeesTotal: number;
};

export function FedIncomeTax({
  nextRelease,
  platformFeesTotal,
}: FedIncomeTaxProps) {
  const detailHref = nextRelease.contractId
    ? `/dashboard/escrows/${nextRelease.contractId}`
    : "/dashboard/escrows";

  const amount =
    nextRelease.amount > 0 ? nextRelease.amount : platformFeesTotal;
  const amountLabel =
    nextRelease.amount > 0 ? "Next release:" : "Platform fees:";

  return (
    <DashboardCard className="flex-1 gap-5">
      <DashboardCardTitle>
        {nextRelease.amount > 0 ? "Next release" : "Platform fees"}
      </DashboardCardTitle>

      <div className="flex flex-col gap-3">
        <DetailRow label="Date:">
          <span className="tabular-nums">
            {nextRelease.dateIso
              ? formatLongUsDate(nextRelease.dateIso)
              : "—"}
          </span>
        </DetailRow>
        <DetailRow label={amountLabel}>
          <span className="tabular-nums">{formatFullCurrency(amount)}</span>
        </DetailRow>
        <DetailRow label="Contract:">
          <span className="inline-flex items-center justify-end gap-2 tabular-nums">
            <span>
              {nextRelease.contractId
                ? `${nextRelease.contractId.slice(0, 4)}…${nextRelease.contractId.slice(-4)}`
                : "—"}
            </span>
          </span>
        </DetailRow>
        <DetailRow label="Status:">
          <Badge className="ml-auto" variant="secondary">
            {nextRelease.statusLabel}
          </Badge>
        </DetailRow>
      </div>

      <Button asChild className="w-full" size="sm" variant="secondary">
        <Link href={detailHref}>
          View Details
          <ArrowRight
            aria-hidden="true"
            data-icon="inline-end"
            strokeWidth={2}
          />
        </Link>
      </Button>
    </DashboardCard>
  );
}

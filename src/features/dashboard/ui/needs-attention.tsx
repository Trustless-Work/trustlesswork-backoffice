import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Scale,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import type { DashboardAttentionItem } from "@/features/dashboard/types/dashboard.types";
import { formatInteger } from "@/helpers/chart-format.helper";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";

const ATTENTION_ICONS: Record<DashboardAttentionItem["icon"], ReactNode> = {
  dispute: <Scale aria-hidden="true" strokeWidth={2} />,
  pending: <CircleDot aria-hidden="true" strokeWidth={2} />,
  unfunded: <Wallet aria-hidden="true" strokeWidth={2} />,
  active: <AlertTriangle aria-hidden="true" strokeWidth={2} />,
  released: <CheckCircle2 aria-hidden="true" strokeWidth={2} />,
};

type NeedsAttentionProps = {
  items: readonly DashboardAttentionItem[];
};

export function NeedsAttention({ items }: NeedsAttentionProps) {
  return (
    <DashboardCard className="gap-2">
      <DashboardCardTitle>Needs attention</DashboardCardTitle>
      <ItemGroup className="gap-0">
        {items.map((row) => (
          <Item asChild key={row.id} size="sm">
            <Link href={row.href}>
              <ItemMedia variant="icon">
                {ATTENTION_ICONS[row.icon]}
              </ItemMedia>
              <ItemContent className="font-normal text-muted-foreground text-xs">
                <ItemTitle>{row.title}</ItemTitle>
                <ItemDescription className="sr-only">
                  {formatInteger(row.count)} open
                </ItemDescription>
              </ItemContent>
              <ItemActions className="gap-1.5">
                <Badge className="size-6 tabular-nums" variant="secondary">
                  {formatInteger(row.count)}
                </Badge>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={2}
                />
              </ItemActions>
            </Link>
          </Item>
        ))}
      </ItemGroup>
    </DashboardCard>
  );
}

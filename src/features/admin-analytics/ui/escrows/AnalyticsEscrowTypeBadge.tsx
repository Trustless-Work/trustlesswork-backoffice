import { Badge } from "@/components/ui/badge";
import type { AnalyticsEscrowType } from "@/features/admin-analytics/types/analytics.types";
import { formatAnalyticsEscrowTypeLabel } from "@/features/admin-analytics/utils/escrow-type-mix.util";

type AnalyticsEscrowTypeBadgeProps = {
  type: AnalyticsEscrowType | null | undefined;
};

export const AnalyticsEscrowTypeBadge = ({
  type,
}: AnalyticsEscrowTypeBadgeProps) => (
  <Badge variant="outline">{formatAnalyticsEscrowTypeLabel(type)}</Badge>
);

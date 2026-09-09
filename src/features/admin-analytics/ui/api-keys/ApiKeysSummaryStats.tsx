"use client";

import { StatGrid } from "@/components/dashboard/stat-grid";
import { formatInteger } from "@/helpers/chart-format.helper";
import type { ApiKeysSummaryResponse } from "@/features/admin-analytics/types/analytics-v2.types";

type ApiKeysSummaryStatsProps = {
  summary: ApiKeysSummaryResponse;
};

export const ApiKeysSummaryStats = ({ summary }: ApiKeysSummaryStatsProps) => (
  <>
    <StatGrid
      columns={4}
      stats={[
        {
          label: "Total keys",
          value: formatInteger(summary.totalKeys),
          delta: null,
          hint: "all time",
        },
        {
          label: "Active",
          value: formatInteger(summary.activeKeys),
          delta: null,
          hint: "not expired",
        },
        {
          label: "New in period",
          value: formatInteger(summary.newInPeriod),
          delta: null,
          hint: "created",
        },
        {
          label: "Never used",
          value: formatInteger(summary.neverUsed),
          delta: null,
          hint: "no activity",
        },
      ]}
    />
    <StatGrid
      columns={3}
      stats={[
        {
          label: "Revoked",
          value: formatInteger(summary.revokedKeys),
          delta: null,
          hint: "keys",
        },
        {
          label: "Expired",
          value: formatInteger(summary.expiredKeys),
          delta: null,
          hint: "keys",
        },
        {
          label: "With activity",
          value: formatInteger(summary.withActivityInPeriod),
          delta: null,
          hint: "in range",
        },
      ]}
    />
  </>
);

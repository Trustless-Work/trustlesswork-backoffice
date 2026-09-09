"use client";

import { useState } from "react";
import { GaugeIcon, TrophyIcon } from "lucide-react";
import type { AnalyticsRange } from "@/features/admin-analytics/constants/analytics-range";
import type { ApiKeysTopBy } from "@/features/admin-analytics/types/analytics-v2.types";
import {
  useApiKeyDetail,
  useApiKeysSummary,
  useApiKeysTop,
} from "@/features/admin-analytics/hooks/useAdminAnalytics";
import { AnalyticsSection } from "@/features/admin-analytics/ui/AnalyticsSection";
import { ApiKeysTabSkeleton } from "@/features/admin-analytics/ui/tabs/ApiKeysTabSkeleton";
import { ApiKeysSummaryStats } from "@/features/admin-analytics/ui/api-keys/ApiKeysSummaryStats";
import { ApiKeyDetailSheet } from "@/features/admin-analytics/ui/api-keys/ApiKeyDetailSheet";
import { TopApiKeysBoard } from "@/features/admin-analytics/ui/api-keys/TopApiKeysBoard";

type ApiKeysTabProps = {
  range: AnalyticsRange;
  topBy: ApiKeysTopBy;
};

export const ApiKeysTab = ({ range, topBy }: ApiKeysTabProps) => {
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);

  const summaryQuery = useApiKeysSummary(range);
  const topQuery = useApiKeysTop(range, topBy);
  const detailQuery = useApiKeyDetail(range, selectedKeyId);

  if (summaryQuery.isPending) {
    return <ApiKeysTabSkeleton />;
  }

  const summary = summaryQuery.data;
  const topItems = topQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <AnalyticsSection
        description="Key inventory and usage coverage for the selected range."
        icon={GaugeIcon}
        title="Overview"
      >
        <div className="flex flex-col gap-4">
          {summaryQuery.errorMessage ? (
            <p className="text-pretty text-muted-foreground text-sm">
              {summaryQuery.errorMessage}
            </p>
          ) : summary ? (
            <ApiKeysSummaryStats summary={summary} />
          ) : null}
        </div>
      </AnalyticsSection>

      <AnalyticsSection
        description={
          topBy !== "requests"
            ? "Revenue, volume, and escrow metrics are platform-level — all keys under one organization share the same figures."
            : "Ranked by request volume attributed to each key."
        }
        icon={TrophyIcon}
        title="Top API keys"
      >
        <TopApiKeysBoard
          by={topBy}
          errorMessage={topQuery.errorMessage}
          isPending={topQuery.isPending}
          items={topItems}
          onSelectKey={setSelectedKeyId}
        />
      </AnalyticsSection>

      <ApiKeyDetailSheet
        data={detailQuery.data}
        isLoading={detailQuery.isPending}
        open={Boolean(selectedKeyId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedKeyId(null);
          }
        }}
      />
    </div>
  );
};

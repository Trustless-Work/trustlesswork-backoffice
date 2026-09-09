"use client";

import { AlertTriangleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DataQualityResponse } from "@/features/admin-analytics/types/analytics.types";

type DataQualityBannerProps = {
  data: DataQualityResponse | undefined;
};

const COUNTER_LABELS: Record<
  keyof Omit<DataQualityResponse, "network">,
  string
> = {
  openGaps: "Open indexer gaps",
  shellRows: "Shell rows",
  removedEscrows: "Removed escrows",
  missingChainClock: "Missing chain clock",
  unbackfilledReleased: "Unbackfilled released escrows",
};

export const DataQualityBanner = ({ data }: DataQualityBannerProps) => {
  if (!data) {
    return null;
  }

  const issues = (
    Object.entries(COUNTER_LABELS) as [
      keyof Omit<DataQualityResponse, "network">,
      string,
    ][]
  ).filter(([key]) => data[key] > 0);

  if (issues.length === 0) {
    return null;
  }

  const tooltipLines = issues.map(([key, label]) => `${label}: ${data[key]}`);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangleIcon className="size-4 shrink-0" />
            <span>Data may be incomplete</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <ul className="space-y-1">
            {tooltipLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

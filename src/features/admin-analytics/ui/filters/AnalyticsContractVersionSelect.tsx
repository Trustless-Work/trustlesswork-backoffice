"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAnalyticsContractVersion,
  useSetAnalyticsContractVersion,
} from "@/features/admin-analytics/providers/AnalyticsContractVersionProvider";
import { CONTRACT_VERSION_FILTERS, isContractVersionFilter } from "@/types";
import type { ContractVersionFilter } from "@/types";

const LABELS: Record<ContractVersionFilter, string> = {
  all: "All generations",
  v1: "Contract v1",
  v2: "Contract v2",
};

export const AnalyticsContractVersionSelect = () => {
  const contractVersion = useAnalyticsContractVersion();
  const setContractVersion = useSetAnalyticsContractVersion();

  return (
    <Select
      value={contractVersion}
      onValueChange={(next) => {
        if (isContractVersionFilter(next)) {
          setContractVersion(next);
        }
      }}
    >
      <SelectTrigger
        aria-label="Escrow contract generation"
        className="h-8 w-full rounded-lg sm:w-[180px]"
      >
        <SelectValue placeholder="Contract generation" />
      </SelectTrigger>
      <SelectContent>
        {CONTRACT_VERSION_FILTERS.map((version) => (
          <SelectItem key={version} value={version}>
            {LABELS[version]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

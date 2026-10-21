"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTRACT_VERSION_FILTERS, isContractVersionFilter } from "@/types";
import type { ContractVersionFilter } from "@/types";

const CONTRACT_VERSION_LABELS: Record<ContractVersionFilter, string> = {
  all: "All Generations",
  v1: "Contract v1",
  v2: "Contract v2",
};

type EscrowContractVersionFilterProps = {
  value: ContractVersionFilter;
  onChange: (value: ContractVersionFilter) => void;
  className?: string;
};

export const EscrowContractVersionFilter = ({
  value,
  onChange,
  className,
}: EscrowContractVersionFilterProps) => (
  <div className="min-w-0 flex-[0.9] space-y-1.5">
    <Label htmlFor="escrow-contract-version" className="capitalize">
      Contract
    </Label>
    <Select
      value={value}
      onValueChange={(next) => {
        if (isContractVersionFilter(next)) {
          onChange(next);
        }
      }}
    >
      <SelectTrigger
        id="escrow-contract-version"
        className={className}
      >
        <SelectValue placeholder="Contract" />
      </SelectTrigger>
      <SelectContent>
        {CONTRACT_VERSION_FILTERS.map((version) => (
          <SelectItem key={version} value={version} className="capitalize">
            {CONTRACT_VERSION_LABELS[version]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ContractVersionFilter } from "@/types";

type AnalyticsContractVersionContextValue = {
  readonly contractVersion: ContractVersionFilter;
  readonly setContractVersion: (value: ContractVersionFilter) => void;
};

const AnalyticsContractVersionContext =
  createContext<AnalyticsContractVersionContextValue | null>(null);

type AnalyticsContractVersionProviderProps = {
  children: ReactNode;
};

export const AnalyticsContractVersionProvider = ({
  children,
}: AnalyticsContractVersionProviderProps) => {
  const [contractVersion, setContractVersion] =
    useState<ContractVersionFilter>("all");
  const value = useMemo(
    () => ({ contractVersion, setContractVersion }),
    [contractVersion],
  );

  return (
    <AnalyticsContractVersionContext.Provider value={value}>
      {children}
    </AnalyticsContractVersionContext.Provider>
  );
};

export function useAnalyticsContractVersion(): ContractVersionFilter {
  return useContext(AnalyticsContractVersionContext)?.contractVersion ?? "all";
}

export function useSetAnalyticsContractVersion(): (
  value: ContractVersionFilter,
) => void {
  const setContractVersion = useContext(
    AnalyticsContractVersionContext,
  )?.setContractVersion;

  return setContractVersion ?? (() => undefined);
}

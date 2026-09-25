"use client";

import { useEscrowRest } from "@trustless-work/escrow";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  escrowDetailQueryKey,
  escrowsListQueryKey,
} from "@/features/escrows/constants/escrow.constants";
import { createEscrowReadService } from "@/features/escrows/services/escrow-read.service";
import {
  DEFAULT_ESCROW_LIST_FILTERS,
  type EscrowListFilters,
  type EscrowListItem,
} from "@/features/escrows/types/escrow.types";
import { isPayrollEngagementId } from "@/features/payroll/utils/payroll-naming.helper";
import { flattenKeysetPages } from "@/lib/pagination";
import { DEFAULT_KEYSET_LIMIT } from "@/types/pagination.entity";
import { useWalletContext } from "@/providers/WalletProvider";

const PAYROLL_LIST_FILTERS: EscrowListFilters = {
  ...DEFAULT_ESCROW_LIST_FILTERS,
  type: "multi-release",
  // Platform-scoped via X-TW-Platform + PAYROLL_API_KEY; wallet "mine"
  // would hide runs when the connected signer is not in roles.
  scope: "all",
  engagementId: "",
  sort: "createdAt",
  order: "desc",
};

function useEscrowReadService() {
  const rest = useEscrowRest();
  return useMemo(() => createEscrowReadService({ rest }), [rest]);
}

export function usePayrollRuns() {
  const { hasWalletHydrated } = useWalletContext();
  const service = useEscrowReadService();

  const query = useInfiniteQuery({
    queryKey: escrowsListQueryKey(PAYROLL_LIST_FILTERS),
    queryFn: ({ pageParam }) =>
      service.listPage(PAYROLL_LIST_FILTERS, {
        cursor: pageParam,
        limit: DEFAULT_KEYSET_LIMIT,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: hasWalletHydrated,
    staleTime: 1000 * 30,
  });

  const runs = useMemo((): EscrowListItem[] => {
    return flattenKeysetPages(query.data).filter((item) =>
      isPayrollEngagementId(
        item.engagementId ?? item.stored.engagementId,
      ),
    );
  }, [query.data]);

  return {
    ...query,
    runs,
    isLoading: !hasWalletHydrated || query.isPending,
  };
}

export function usePayrollRunDetail(contractId: string) {
  const { hasWalletHydrated } = useWalletContext();
  const service = useEscrowReadService();
  const resolvedContractId = contractId.trim();
  const canFetch = hasWalletHydrated && resolvedContractId.length > 0;

  const query = useQuery({
    queryKey: escrowDetailQueryKey(resolvedContractId),
    queryFn: () => service.getByContractId(resolvedContractId),
    enabled: canFetch,
    staleTime: 1000 * 30,
  });

  const isInitialLoading =
    canFetch && query.isPending && query.data === undefined;

  return {
    ...query,
    detail: query.data ?? null,
    escrow: query.data?.escrow ?? null,
    isResolving: !hasWalletHydrated || isInitialLoading,
  };
}

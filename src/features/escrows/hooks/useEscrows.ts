"use client";

import { useEscrowRest } from "@trustless-work/escrow";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import {
  escrowDetailQueryKey,
  escrowsListQueryKey,
} from "@/features/escrows/constants/escrow.constants";
import { useEscrowListSearchParams } from "@/features/escrows/hooks/useEscrowListSearchParams";
import { createEscrowReadService } from "@/features/escrows/services/escrow-read.service";
import type { EscrowListFilters } from "@/features/escrows/types/escrow.types";
import { flattenKeysetPages } from "@/lib/pagination";
import { DEFAULT_KEYSET_LIMIT } from "@/types/pagination.entity";
import { useWalletContext } from "@/providers/WalletProvider";

function useEscrowReadService() {
  const rest = useEscrowRest();

  return useMemo(() => createEscrowReadService({ rest }), [rest]);
}

export function useEscrowsInfinite(filters?: EscrowListFilters) {
  const { filters: urlFilters } = useEscrowListSearchParams();
  const { hasWalletHydrated } = useWalletContext();
  const service = useEscrowReadService();

  const resolvedFilters = useMemo(
    (): EscrowListFilters => filters ?? urlFilters,
    [filters, urlFilters],
  );

  const canFetch = hasWalletHydrated;

  const query = useInfiniteQuery({
    queryKey: escrowsListQueryKey(resolvedFilters),
    queryFn: ({ pageParam }) =>
      service.listPage(resolvedFilters, {
        cursor: pageParam,
        limit: DEFAULT_KEYSET_LIMIT,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: canFetch,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  });

  const escrows = useMemo(
    () => flattenKeysetPages(query.data),
    [query.data],
  );

  return {
    ...query,
    escrows,
    filters: resolvedFilters,
    isLoading: !canFetch || query.isPending,
  };
}

export function useEscrowDetail(contractId: string) {
  const { hasWalletHydrated } = useWalletContext();
  const service = useEscrowReadService();
  const resolvedContractId = contractId.trim();
  const canFetch = hasWalletHydrated && resolvedContractId.length > 0;

  const query = useQuery({
    queryKey: escrowDetailQueryKey(resolvedContractId),
    queryFn: () => service.getByContractId(resolvedContractId),
    enabled: canFetch,
    staleTime: 1000 * 30,
    refetchInterval: (current) => {
      if (current.state.data === null && current.state.dataUpdatedAt > 0) {
        return 2000;
      }
      return false;
    },
    refetchIntervalInBackground: false,
  });

  const isInitialLoading =
    canFetch && query.isPending && query.data === undefined;

  const isResolving = !hasWalletHydrated || isInitialLoading;

  return {
    ...query,
    detail: query.data ?? null,
    escrow: query.data?.escrow ?? null,
    isResolving,
  };
}

/** @deprecated Prefer useEscrowsInfinite */
export function useEscrowsList() {
  return useEscrowsInfinite();
}

/** @deprecated Prefer useEscrowsInfinite */
export function useEscrows() {
  return useEscrowsInfinite();
}

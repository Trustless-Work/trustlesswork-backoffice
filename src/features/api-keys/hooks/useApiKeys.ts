"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiKeyService } from "@/features/api-keys/services/api-key.service";
import { flattenKeysetPages } from "@/lib/pagination";
import { DEFAULT_KEYSET_LIMIT } from "@/types/pagination.entity";
import type { NetworkType } from "@/types/network.entity";

export const API_KEYS_QUERY_KEY = ["user", "api-keys"] as const;

export function apiKeysQueryKey(network: NetworkType) {
  return [...API_KEYS_QUERY_KEY, network] as const;
}

export function useApiKeys(network: NetworkType, enabled = true) {
  const query = useInfiniteQuery({
    queryKey: apiKeysQueryKey(network),
    enabled,
    queryFn: ({ pageParam }) =>
      apiKeyService.listApiKeysPage(
        {
          limit: DEFAULT_KEYSET_LIMIT,
          cursor: pageParam,
        },
        network,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 1000 * 60,
  });

  const apiKeys = useMemo(() => flattenKeysetPages(query.data), [query.data]);

  return {
    ...query,
    apiKeys,
  };
}

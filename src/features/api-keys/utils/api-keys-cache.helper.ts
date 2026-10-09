import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { apiKeysQueryKey } from "@/features/api-keys/hooks/useApiKeys";
import type { ApiKeyResponse } from "@/features/api-keys/types/api-key.types";
import type { NetworkType } from "@/types/network.entity";
import type { KeysetPage } from "@/types/pagination.entity";

type ApiKeysCache = InfiniteData<KeysetPage<ApiKeyResponse>>;

export function deactivateApiKeyInCache(
  queryClient: QueryClient,
  keyId: string,
  network: NetworkType,
): void {
  queryClient.setQueriesData<ApiKeysCache>(
    { queryKey: apiKeysQueryKey(network) },
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          data: page.data.map((apiKey) =>
            apiKey.id === keyId ? { ...apiKey, active: false } : apiKey,
          ),
        })),
      };
    },
  );
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiKeysQueryKey } from "@/features/api-keys/hooks/useApiKeys";
import { apiKeyService } from "@/features/api-keys/services/api-key.service";
import { deactivateApiKeyInCache } from "@/features/api-keys/utils/api-keys-cache.helper";
import { parseApiError } from "@/lib/api-error";
import { playSound } from "@/lib/sounds";
import type { NetworkType } from "@/types/network.entity";

type RevokeApiKeyVariables = {
  keyId: string;
  network: NetworkType;
};

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keyId, network }: RevokeApiKeyVariables) =>
      apiKeyService.revokeApiKey(keyId, network),
    onSuccess: (_result, { keyId, network }) => {
      deactivateApiKeyInCache(queryClient, keyId, network);
      void queryClient.invalidateQueries({
        queryKey: apiKeysQueryKey(network),
      });
      playSound("delete");
      toast.success("API key revoked", {
        description: "The key can no longer authenticate requests.",
      });
    },
    onError: (error) => {
      toast.error(parseApiError(error).detail);
    },
  });
}

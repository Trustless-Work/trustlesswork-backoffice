"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiKeysQueryKey } from "@/features/api-keys/hooks/useApiKeys";
import { apiKeyService } from "@/features/api-keys/services/api-key.service";
import { deactivateApiKeyInCache } from "@/features/api-keys/utils/api-keys-cache.helper";
import { parseApiError } from "@/lib/api-error";
import { playSound } from "@/lib/sounds";
import type { NetworkType } from "@/types/network.entity";

type RotateApiKeyVariables = {
  keyId: string;
  network: NetworkType;
};

type UseRotateApiKeyOptions = {
  onRotated?: (apiKey: string) => void;
};

export function useRotateApiKey(options?: UseRotateApiKeyOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keyId, network }: RotateApiKeyVariables) =>
      apiKeyService.rotateApiKey(keyId, network),
    onSuccess: async (result, { keyId, network }) => {
      options?.onRotated?.(result.apiKey);
      playSound("accept");
      toast.success("API key rotated", {
        description: "Copy your new key now — it won't be shown again.",
      });

      deactivateApiKeyInCache(queryClient, keyId, network);
      try {
        await apiKeyService.revokeApiKey(keyId, network);
      } catch (error) {
        toast.error(parseApiError(error).detail, {
          description:
            "The new key is active, but the previous key could not be revoked automatically. Revoke it manually.",
        });
      } finally {
        void queryClient.invalidateQueries({
          queryKey: apiKeysQueryKey(network),
        });
      }
    },
    onError: (error) => {
      toast.error(parseApiError(error).detail);
    },
  });
}

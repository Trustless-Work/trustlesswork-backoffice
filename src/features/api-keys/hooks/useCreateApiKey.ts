"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiKeysQueryKey } from "@/features/api-keys/hooks/useApiKeys";
import { apiKeyService } from "@/features/api-keys/services/api-key.service";
import type { CreateApiKeyInput } from "@/features/api-keys/types/api-key.types";
import { parseApiError } from "@/lib/api-error";
import { playSound } from "@/lib/sounds";
import type { NetworkType } from "@/types/network.entity";

type CreateApiKeyVariables = {
  input: CreateApiKeyInput;
  network: NetworkType;
};

type UseCreateApiKeyOptions = {
  onCreated?: (apiKey: string) => void;
};

export function useCreateApiKey(options?: UseCreateApiKeyOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, network }: CreateApiKeyVariables) =>
      apiKeyService.createApiKey(input, network),
    onSuccess: (result, { network }) => {
      void queryClient.invalidateQueries({
        queryKey: apiKeysQueryKey(network),
      });
      playSound("accept");
      toast.success("API key created", {
        description: "Copy your key now — it won't be shown again.",
      });
      options?.onCreated?.(result.apiKey);
    },
    onError: (error) => {
      toast.error(parseApiError(error).detail);
    },
  });
}

"use client";

import { useMutation } from "@tanstack/react-query";
import type { Hex } from "viem";
import { toast } from "sonner";
import { completeMintOnEvm } from "@/features/cctp-bridge/lib/evm";
import { getCctpChainByDomain } from "@/features/cctp-bridge/lib/chains";
import { parseApiError } from "@/lib/api-error";

/** Completes the mint on the destination EVM chain via `MessageTransmitterV2.receiveMessage` (receiver's own wallet, no relayer). Returns the dest tx hash. */
export function useCompleteCctpMint() {
  return useMutation({
    mutationFn: async (params: {
      destinationDomain: number;
      message: string;
      attestation: string;
    }) => {
      const chain = getCctpChainByDomain(params.destinationDomain);
      if (!chain) {
        throw new Error("Unsupported destination chain for mint completion.");
      }

      return completeMintOnEvm({
        chain,
        message: params.message as Hex,
        attestation: params.attestation as Hex,
      });
    },
    onSuccess: () => {
      toast.success("Mint completed on the destination chain");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : parseApiError(error).detail,
      );
    },
  });
}

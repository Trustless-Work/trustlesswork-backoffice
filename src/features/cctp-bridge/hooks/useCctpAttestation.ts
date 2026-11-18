"use client";

import { useQuery } from "@tanstack/react-query";
import { cctpBridgeService } from "@/features/cctp-bridge/services/cctp-bridge.service";

const ATTESTATION_POLL_INTERVAL_MS = 8000;

/**
 * Polls Circle's attestation for a CCTP burn (the Stellar release tx hash)
 * until it's ready. Pass `enabled: false` until you have a burn tx hash to
 * poll for.
 */
export function useCctpAttestation(burnTxHash: string | null | undefined) {
  return useQuery({
    queryKey: ["cctp", "attestation", burnTxHash],
    queryFn: () => cctpBridgeService.getAttestation(burnTxHash as string),
    enabled: Boolean(burnTxHash),
    refetchInterval: (query) =>
      query.state.data?.status === "complete" ? false : ATTESTATION_POLL_INTERVAL_MS,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { cctpBridgeService } from "@/features/cctp-bridge/services/cctp-bridge.service";
import type {
  EscrowKind,
  CrossChainDestination,
} from "@/features/cctp-bridge/types/cctp-bridge.types";

export function crossChainDestinationQueryKey(
  escrowKind: EscrowKind,
  contractId: string,
  milestoneIndex?: number,
) {
  return ["cctp", "cross-chain-destination", escrowKind, contractId, milestoneIndex] as const;
}

/**
 * Reads the receiver's registered cross-chain payout preference for an
 * escrow (or milestone, for multi-release). `null` means the default: a
 * normal Stellar payout.
 */
export function useCrossChainDestination(params: {
  escrowKind: EscrowKind;
  contractId: string;
  milestoneIndex?: number;
  enabled?: boolean;
}) {
  const { escrowKind, contractId, milestoneIndex, enabled = true } = params;

  return useQuery<CrossChainDestination | null>({
    queryKey: crossChainDestinationQueryKey(escrowKind, contractId, milestoneIndex),
    queryFn: () =>
      cctpBridgeService.getCrossChainDestination({
        escrowKind,
        contractId,
        milestoneIndex,
      }),
    enabled: enabled && Boolean(contractId),
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { cctpBridgeService } from "@/features/cctp-bridge/services/cctp-bridge.service";
import type { CctpDestinationDomain } from "@/features/cctp-bridge/types/cctp-bridge.types";

/**
 * Live estimate of the CCTP forwarding fee for a destination, shown as soon
 * as the receiver picks a chain. Gas-driven snapshot, so a short `staleTime`
 * keeps it fresh. Takes a plain `number` (preview only; the backend
 * re-validates the domain).
 */
export function useFeeQuote(destinationDomain: number | undefined) {
  return useQuery({
    queryKey: ["cctp", "fee-quote", destinationDomain],
    queryFn: () =>
      cctpBridgeService.getFeeQuote(
        destinationDomain as CctpDestinationDomain,
      ),
    enabled: destinationDomain !== undefined,
    staleTime: 15_000,
  });
}

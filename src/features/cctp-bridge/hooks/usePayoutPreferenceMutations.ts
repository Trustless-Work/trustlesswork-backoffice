"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWallet } from "@/components/tw-blocks/wallet-kit/useWallet";
import { signTransaction } from "@/components/tw-blocks/wallet-kit/wallet-kit";
import { useWalletContext } from "@/providers/WalletProvider";
import { cctpBridgeService } from "@/features/cctp-bridge/services/cctp-bridge.service";
import { crossChainDestinationQueryKey } from "@/features/cctp-bridge/hooks/useCrossChainDestination";
import { parseApiError } from "@/lib/api-error";
import type {
  CctpDestinationDomain,
  EscrowKind,
} from "@/features/cctp-bridge/types/cctp-bridge.types";

interface EscrowContext {
  escrowKind: EscrowKind;
  contractId: string;
  milestoneIndex?: number;
}

async function ensureReceiverAddress(
  walletAddress: string | null,
  connectWallet: () => Promise<string>,
): Promise<string> {
  if (walletAddress) return walletAddress;
  return connectWallet();
}

/** Step 1: builds the unsigned tx on the backend and returns `estimatedFeeUsdc`, so the receiver confirms the fee before signing. */
export function useBuildPayoutPreference(escrow: EscrowContext) {
  const { connectWallet } = useWallet();
  const { walletAddress } = useWalletContext();

  return useMutation({
    mutationFn: async (params: {
      destinationDomain: CctpDestinationDomain;
      recipientAddress: string;
    }) => {
      const receiver = await ensureReceiverAddress(walletAddress, connectWallet);
      const built = await cctpBridgeService.buildSetCrossChainDestination({
        ...escrow,
        receiver,
        destinationDomain: params.destinationDomain,
        recipientAddress: params.recipientAddress,
      });
      return { ...built, receiver };
    },
    onError: (error) => {
      toast.error(parseApiError(error).detail);
    },
  });
}

/** Step 2: signs the built tx with the receiver's Stellar wallet and submits it. */
export function useConfirmPayoutPreference(escrow: EscrowContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { unsignedXdr: string; receiver: string }) => {
      const signedXdr = await signTransaction({
        unsignedTransaction: params.unsignedXdr,
        address: params.receiver,
      });
      return cctpBridgeService.sendTransaction(signedXdr);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: crossChainDestinationQueryKey(
          escrow.escrowKind,
          escrow.contractId,
          escrow.milestoneIndex,
        ),
      });
      toast.success("Payout preference saved", {
        description: "Your next release will route to the destination you selected.",
      });
    },
    onError: (error) => {
      toast.error(parseApiError(error).detail);
    },
  });
}

/** Clears the payout preference, reverting future releases to a Stellar payout. */
export function useClearPayoutPreference(escrow: EscrowContext) {
  const queryClient = useQueryClient();
  const { connectWallet } = useWallet();
  const { walletAddress } = useWalletContext();

  return useMutation({
    mutationFn: async () => {
      const receiver = await ensureReceiverAddress(walletAddress, connectWallet);

      const { unsignedXdr } = await cctpBridgeService.buildClearCrossChainDestination({
        ...escrow,
        receiver,
      });

      const signedXdr = await signTransaction({
        unsignedTransaction: unsignedXdr,
        address: receiver,
      });

      return cctpBridgeService.sendTransaction(signedXdr);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: crossChainDestinationQueryKey(
          escrow.escrowKind,
          escrow.contractId,
          escrow.milestoneIndex,
        ),
      });
      toast.success("Reverted to Stellar payout");
    },
    onError: (error) => {
      toast.error(parseApiError(error).detail);
    },
  });
}

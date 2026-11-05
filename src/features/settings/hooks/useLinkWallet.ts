"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWallet } from "@/components/tw-blocks/wallet-kit/useWallet";
import {
  getChallengeNetwork,
  signTransaction,
} from "@/components/tw-blocks/wallet-kit/wallet-kit";
import { walletService } from "@/features/settings/services/wallet.service";
import { USER_WALLETS_QUERY_KEY } from "@/features/settings/hooks/useUserWallets";
import { isApiError, parseApiError } from "@/lib/api-error";
import { playSound } from "@/lib/sounds";
import { formatAddress } from "@/helpers/format.helper";

function isWalletModalDismissed(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === -1
  );
}

function getLinkWalletErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes("already linked")) {
    return error.message;
  }

  if (isApiError(error) && (error.status === 422 || error.status === 409)) {
    return "This wallet belongs to another account. Use a different wallet or contact support.";
  }

  return parseApiError(error).detail;
}

export function useLinkWallet() {
  const queryClient = useQueryClient();
  const { connectWallet } = useWallet();
  const [phase, setPhase] = useState<"idle" | "connecting" | "signing">("idle");

  const mutation = useMutation({
    mutationFn: async (existingAddresses: string[]) => {
      setPhase("connecting");
      const address = await connectWallet();

      if (existingAddresses.includes(address)) {
        throw new Error("This wallet is already linked to your account.");
      }

      setPhase("signing");
      const challenge = await walletService.requestLinkChallenge(
        address,
        await getChallengeNetwork(),
      );
      const signedXdr = await signTransaction({
        unsignedTransaction: challenge.xdr,
        address,
        networkPassphrase: challenge.networkPassphrase,
      });

      return walletService.verifyLink(address, signedXdr);
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: USER_WALLETS_QUERY_KEY });
      playSound("accept");
      toast.success("Wallet linked", {
        description: `${formatAddress(result.address, 6)} is now verified on your account.`,
      });
      setPhase("idle");
    },
    onError: (error) => {
      if (isWalletModalDismissed(error)) {
        setPhase("idle");
        return;
      }

      toast.error(getLinkWalletErrorMessage(error));
      setPhase("idle");
    },
  });

  const linkWallet = useCallback(
    (existingAddresses: string[]) => {
      mutation.mutate(existingAddresses);
    },
    [mutation],
  );

  return {
    linkWallet,
    isLinking: phase !== "idle" || mutation.isPending,
    phase,
  };
}

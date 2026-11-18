"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCctpAttestation } from "@/features/cctp-bridge/hooks/useCctpAttestation";
import { useCompleteCctpMint } from "@/features/cctp-bridge/hooks/useCompleteCctpMint";
import { getCctpDomainLabel } from "@/features/cctp-bridge/lib/chains";
import { formatAddress } from "@/helpers/format.helper";

type CompleteCctpMintDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The Stellar release tx hash that burned the receiver's share via CCTP. */
  burnTxHash: string;
  destinationDomain: number;
  recipientAddress: string;
};

/**
 * Shown after a release that routed the receiver's share cross-chain. Polls
 * Circle's attestation, then lets the receiver submit `receiveMessage` on the
 * destination chain with their own EVM wallet (no relayer).
 */
export const CompleteCctpMintDialog = ({
  open,
  onOpenChange,
  burnTxHash,
  destinationDomain,
  recipientAddress,
}: CompleteCctpMintDialogProps) => {
  const { data: attestation, isFetching } = useCctpAttestation(
    open ? burnTxHash : null,
  );
  const completeMint = useCompleteCctpMint();

  const isReady = attestation?.status === "complete";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete your delivery</DialogTitle>
          <DialogDescription>
            Your share was burned on Stellar for delivery to{" "}
            <span className="font-medium text-foreground">
              {formatAddress(recipientAddress, 6)}
            </span>{" "}
            on {getCctpDomainLabel(destinationDomain)}. Finish by submitting
            the mint with your EVM wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isReady ? (
            <span>Attestation ready — you can complete the mint now.</span>
          ) : (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>
                {isFetching ? "Checking Circle's attestation..." : "Waiting for Circle's attestation..."}
              </span>
            </>
          )}
        </div>

        {completeMint.data ? (
          <p className="text-sm text-muted-foreground">
            Minted on the destination chain. Tx: {formatAddress(completeMint.data, 6)}
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            disabled={!isReady || completeMint.isPending || Boolean(completeMint.data)}
            onClick={() => {
              if (!attestation?.message || !attestation?.attestation) return;
              completeMint.mutate({
                destinationDomain,
                message: attestation.message,
                attestation: attestation.attestation,
              });
            }}
          >
            {completeMint.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Completing mint...
              </>
            ) : (
              "Complete mint"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

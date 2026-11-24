"use client";

import { useEffect, useState } from "react";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAddress } from "@/helpers/format.helper";
import { getCctpDestinationOptions } from "@/features/cctp-bridge/lib/chains";
import { useCrossChainDestination } from "@/features/cctp-bridge/hooks/useCrossChainDestination";
import { useFeeQuote } from "@/features/cctp-bridge/hooks/useFeeQuote";
import {
  useBuildPayoutPreference,
  useClearPayoutPreference,
  useConfirmPayoutPreference,
} from "@/features/cctp-bridge/hooks/usePayoutPreferenceMutations";
import { usePayoutPreferenceForm } from "@/features/cctp-bridge/hooks/usePayoutPreferenceForm";
import type {
  EscrowKind,
  SetCrossChainDestinationResponse,
} from "@/features/cctp-bridge/types/cctp-bridge.types";

type PayoutPreferenceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escrowKind: EscrowKind;
  contractId: string;
  milestoneIndex?: number;
};

function formatUsdc(amount: number): string {
  return `$${amount.toFixed(amount < 1 ? 4 : 2)}`;
}

/**
 * Receiver-only dialog to pick the next-release payout: Stellar (default) or
 * a chain + address via CCTP. Two-step so the receiver sees the fee first:
 * the form step shows a live estimate, the confirm step shows the exact
 * baked-in `max_fee` and only then prompts the wallet signature.
 */
export const PayoutPreferenceDialog = ({
  open,
  onOpenChange,
  escrowKind,
  contractId,
  milestoneIndex,
}: PayoutPreferenceDialogProps) => {
  const escrow = { escrowKind, contractId, milestoneIndex };
  const chains = getCctpDestinationOptions();

  const { data: current, isLoading } = useCrossChainDestination({
    ...escrow,
    enabled: open,
  });

  const [pendingTx, setPendingTx] =
    useState<SetCrossChainDestinationResponse & { receiver: string }>();

  const buildPreference = useBuildPayoutPreference(escrow);
  const confirmPreference = useConfirmPayoutPreference(escrow);
  const clearPreference = useClearPayoutPreference(escrow);
  const isBusy =
    buildPreference.isPending ||
    confirmPreference.isPending ||
    clearPreference.isPending;

  const { form, onSubmit } = usePayoutPreferenceForm({
    isSubmitting: buildPreference.isPending,
    onSubmit: async (values) => {
      const built = await buildPreference.mutateAsync(values);
      setPendingTx(built);
    },
  });

  const selectedDomain = form.watch("destinationDomain");
  const feeQuote = useFeeQuote(
    pendingTx ? undefined : selectedDomain,
  );

  useEffect(() => {
    if (open) {
      setPendingTx(undefined);
      form.reset({
        destinationDomain: current?.destinationDomain ?? 6,
        recipientAddress: current?.recipient ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, current]);

  const handleConfirmAndSign = async () => {
    if (!pendingTx) return;
    await confirmPreference.mutateAsync(pendingTx);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How you want to get paid</DialogTitle>
          <DialogDescription>
            Choose where your share lands when this escrow releases. Leave it
            unset to receive USDC on Stellar as usual.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : pendingTx ? (
          <>
            <div className="rounded-md border bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">You&apos;re about to pay</p>
              <p className="text-lg font-semibold text-foreground">
                {formatUsdc(pendingTx.estimatedFeeUsdc)} USDC
              </p>
              <p className="mt-1 text-muted-foreground">
                in forwarding fees, deducted automatically from your share
                when this escrow releases.
              </p>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPendingTx(undefined)}
                disabled={isBusy}
              >
                Back
              </Button>
              <Button onClick={handleConfirmAndSign} disabled={isBusy}>
                {confirmPreference.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm & sign"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {current ? (
              <p className="text-sm text-muted-foreground">
                Currently set to route to{" "}
                <span className="font-medium text-foreground">
                  {formatAddress(current.recipient, 6)}
                </span>{" "}
                on domain {current.destinationDomain}.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No cross-chain preference set — you&apos;ll receive USDC on
                Stellar.
              </p>
            )}

            <Form {...form}>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="destinationDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination chain</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(Number(value))}
                        disabled={isBusy}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a chain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {chains.map((chain) => (
                            <SelectItem key={chain.domain} value={String(chain.domain)}>
                              {chain.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {feeQuote.isLoading
                          ? "Checking the current fee..."
                          : feeQuote.data
                            ? `Estimated fee: ~${formatUsdc(feeQuote.data.estimatedFeeUsdc)} USDC (gas-driven, may change slightly by the time you confirm)`
                            : null}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipientAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Recipient address on the destination chain"
                          autoComplete="off"
                          disabled={isBusy}
                        />
                      </FormControl>
                      <FormDescription>
                        The address that will receive native USDC on the
                        destination chain.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                  {current ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => clearPreference.mutate()}
                      disabled={isBusy}
                    >
                      {clearPreference.isPending ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Reverting...
                        </>
                      ) : (
                        "Revert to Stellar"
                      )}
                    </Button>
                  ) : (
                    <span />
                  )}

                  <Button type="submit" disabled={isBusy}>
                    {buildPreference.isPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

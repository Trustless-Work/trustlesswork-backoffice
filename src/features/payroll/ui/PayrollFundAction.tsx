"use client";

import { Loader2, WalletIcon } from "lucide-react";
import { useState } from "react";
import { UsdcAmount } from "@/components/shared/UsdcAmount";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFundEscrowForm } from "@/features/escrows/hooks/useEscrowActionForms";
import { useEscrowActionsContext } from "@/features/escrows/providers/EscrowActionsProvider";
import type { StoredEscrow } from "@/features/escrows/types/escrow.types";
import { getEscrowDisplayAmount } from "@/features/escrows/utils/escrow-display.helper";
import type { FundEscrowFormData } from "@/features/escrows/schemas/escrow-action.schemas";

type PayrollFundActionProps = {
  escrow: StoredEscrow;
  className?: string;
};

export const PayrollFundAction = ({
  escrow,
  className,
}: PayrollFundActionProps) => {
  const [open, setOpen] = useState(false);
  const form = useFundEscrowForm();
  const { fund, loading, walletAddress } = useEscrowActionsContext();
  const defaultAmount = getEscrowDisplayAmount(escrow);

  const handleOpen = () => {
    form.reset({ amount: String(defaultAmount) });
    setOpen(true);
  };

  const handleSubmit = form.handleSubmit(async (values: FundEscrowFormData) => {
    if (!walletAddress) {
      return;
    }

    const result = await fund({
      contractId: escrow.contractId,
      signer: walletAddress,
      amount: values.amount,
    });

    if (result) {
      setOpen(false);
    }
  });

  return (
    <>
      <Button type="button" onClick={handleOpen} className={className}>
        <WalletIcon />
        Fund Payroll
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            form.reset({ amount: String(defaultAmount) });
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Fund Payroll</DialogTitle>
              <DialogDescription>
                Deposit USDC into this payroll escrow so team payments can be
                released.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="payroll-fund-amount">Amount</Label>
              <Input
                id="payroll-fund-amount"
                type="number"
                min={0}
                step="any"
                placeholder="e.g. 5000"
                {...form.register("amount")}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                Suggested run total:
                <UsdcAmount
                  amount={defaultAmount}
                  symbol="USDC"
                  size="sm"
                  emphasis
                />
              </div>
              {form.formState.errors.amount ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              ) : null}
              {!walletAddress ? (
                <p className="text-sm text-muted-foreground">
                  Connect your wallet in the navbar to fund.
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !walletAddress}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Funding…
                  </>
                ) : (
                  "Fund"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

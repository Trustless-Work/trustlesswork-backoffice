"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type WalletNetworkMismatchDialogProps = {
  open: boolean;
  isSwitching: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export const WalletNetworkMismatchDialog = ({
  open,
  isSwitching,
  onOpenChange,
  onConfirm,
}: WalletNetworkMismatchDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="data-[size=default]:max-w-sm">
      <AlertDialogHeader className="place-items-start text-left">
        <AlertDialogMedia className="bg-destructive/10">
          <AlertTriangle className="text-destructive" />
        </AlertDialogMedia>
        <AlertDialogTitle>Your wallet is on Mainnet</AlertDialogTitle>
        <AlertDialogDescription>
          You&apos;re switching the app to Testnet. While the app and your
          wallet are on different networks, actions like creating an escrow can
          fail. Make sure both match.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isSwitching}>
          Stay on Mainnet
        </AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={onConfirm}
          disabled={isSwitching}
        >
          {isSwitching ? (
            <>
              <Loader2 className="animate-spin" />
              Switching...
            </>
          ) : (
            "Switch to Testnet anyway"
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

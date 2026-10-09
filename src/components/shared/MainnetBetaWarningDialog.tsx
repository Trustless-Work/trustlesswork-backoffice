"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

type MainnetBetaWarningDialogProps = {
  open: boolean;
  isSwitching: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

const WARNINGS = [
  {
    title: "Mainnet is in beta",
    body: "This is not a finished release. Expect bugs, interruptions, and behavior that can still change.",
  },
  {
    title: "Do not add large amounts of funds",
    body: "Use only money you can afford to lose. Balances, escrows, and transactions are real and cannot be reversed.",
  },
  {
    title: "We are not responsible",
    body: "Trustless Work is not responsible for lost funds, failed transactions, or anything else that happens while mainnet is in beta.",
  },
] as const;

export const MainnetBetaWarningDialog = ({
  open,
  isSwitching,
  onOpenChange,
  onConfirm,
}: MainnetBetaWarningDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="data-[size=default]:max-w-sm data-[size=default]:sm:max-w-md">
      <AlertDialogHeader className="place-items-start text-left">
        <AlertDialogMedia className="bg-destructive/10">
          <AlertTriangle className="text-destructive" />
        </AlertDialogMedia>
        <AlertDialogTitle className="flex flex-wrap items-center gap-2">
          Mainnet beta warning
          <Badge variant="destructive">Beta</Badge>
        </AlertDialogTitle>
        <AlertDialogDescription className="sr-only">
          Mainnet is in beta and is not a finished release. Do not add large
          amounts of funds; use only money you can afford to lose. Transactions
          are real and cannot be reversed. Trustless Work is not responsible
          for lost funds, failed transactions, or anything else that happens
          while mainnet is in beta.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <p className="text-sm text-muted-foreground">
        Nothing changes until you confirm. Read every point below.
      </p>

      <ul className="flex flex-col gap-2">
        {WARNINGS.map((warning) => (
          <li
            key={warning.title}
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm"
          >
            <p className="font-medium text-destructive">{warning.title}</p>
            <p className="mt-1 text-foreground">{warning.body}</p>
          </li>
        ))}
      </ul>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isSwitching}>
          Stay on Testnet
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
            "I understand, switch to Mainnet"
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

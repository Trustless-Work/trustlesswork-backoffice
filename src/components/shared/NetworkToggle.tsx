"use client";

import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/useMounted";
import { Switch } from "@/components/ui/switch";
import { MainnetBetaWarningDialog } from "@/components/shared/MainnetBetaWarningDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import useNetwork from "@/hooks/useNetwork";
import type { NetworkType } from "@/types/network.entity";

const NETWORK_SWITCHING_ENABLED = true;

const TOGGLE_CLASSNAME =
  "flex h-10 shrink-0 items-center gap-1.5 rounded-4xl border border-border bg-background px-3";

type NetworkToggleProps = {
  className?: string;
};

export const NetworkToggle = ({ className }: NetworkToggleProps) => {
  const { currentNetwork, changeNetwork, isReseting } = useNetwork();
  const mounted = useMounted();
  const [showMainnetDialog, setShowMainnetDialog] = useState(false);
  const [pendingNetwork, setPendingNetwork] = useState<NetworkType | null>(
    null,
  );

  useEffect(() => {
    if (!NETWORK_SWITCHING_ENABLED && currentNetwork !== "testnet") {
      changeNetwork("testnet");
    }
  }, [changeNetwork, currentNetwork]);

  const switchChecked = NETWORK_SWITCHING_ENABLED
    ? pendingNetwork === "mainnet" || currentNetwork === "mainnet"
    : false;

  const handleSwitchChange = (checked: boolean) => {
    if (!NETWORK_SWITCHING_ENABLED) {
      return;
    }

    if (checked) {
      setPendingNetwork("mainnet");
      setShowMainnetDialog(true);
      return;
    }

    setPendingNetwork(null);
    changeNetwork("testnet");
  };

  const handleConfirmMainnet = () => {
    setShowMainnetDialog(false);
    setPendingNetwork(null);
    changeNetwork("mainnet");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setShowMainnetDialog(open);

    if (!open) {
      setPendingNetwork(null);
    }
  };

  if (!mounted) {
    return (
      <div
        className={cn(TOGGLE_CLASSNAME, "opacity-0", className)}
        aria-hidden
      />
    );
  }

  const toggle = (
    <div
      className={cn(
        TOGGLE_CLASSNAME,
        !NETWORK_SWITCHING_ENABLED && "cursor-not-allowed opacity-70",
        className,
      )}
    >
      <span
        className={cn(
          "text-xs font-medium leading-none sm:text-sm",
          !switchChecked ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <span className="sm:hidden">Test</span>
        <span className="hidden sm:inline">Testnet</span>
      </span>
      <Switch
        size="sm"
        checked={switchChecked}
        onCheckedChange={handleSwitchChange}
        disabled={!NETWORK_SWITCHING_ENABLED || isReseting}
        aria-label="Toggle Stellar network"
        className={NETWORK_SWITCHING_ENABLED ? "cursor-pointer" : undefined}
      />
      <span
        className={cn(
          "text-xs font-medium leading-none sm:text-sm",
          switchChecked ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <span className="sm:hidden">Main</span>
        <span className="hidden sm:inline">Mainnet</span>
      </span>
    </div>
  );

  return (
    <>
      {NETWORK_SWITCHING_ENABLED ? (
        toggle
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{toggle}</TooltipTrigger>
          <TooltipContent>Not available yet. Coming soon.</TooltipContent>
        </Tooltip>
      )}

      {NETWORK_SWITCHING_ENABLED ? (
        <MainnetBetaWarningDialog
          open={showMainnetDialog}
          isSwitching={isReseting}
          onOpenChange={handleDialogOpenChange}
          onConfirm={handleConfirmMainnet}
        />
      ) : null}
    </>
  );
};

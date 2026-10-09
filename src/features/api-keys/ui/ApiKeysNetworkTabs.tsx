"use client";

import { RoundedTabs } from "@/components/ui/custom-tab";
import { isValidStellarNetwork } from "@/helpers/validators.helper";
import type { NetworkType } from "@/types/network.entity";

type ApiKeysNetworkTabsProps = {
  network: NetworkType;
  onNetworkChange: (network: NetworkType) => void;
};

const NETWORK_TAB_ITEMS = [
  {
    value: "testnet",
    label: "Testnet",
    icon: (
      <span className="size-2 rounded-full bg-muted-foreground" aria-hidden />
    ),
  },
  {
    value: "mainnet",
    label: "Mainnet",
    icon: <span className="size-2 rounded-full bg-primary" aria-hidden />,
  },
];

export const ApiKeysNetworkTabs = ({
  network,
  onNetworkChange,
}: ApiKeysNetworkTabsProps) => (
  <RoundedTabs
    ariaLabel="API key network"
    fullWidth
    items={NETWORK_TAB_ITEMS}
    value={network}
    onValueChange={(value) => {
      if (isValidStellarNetwork(value)) {
        onNetworkChange(value);
      }
    }}
  />
);

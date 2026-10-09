"use client";

import {
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiKeysNetworkTabs } from "@/features/api-keys/ui/ApiKeysNetworkTabs";
import { getApiKeyNetworkLabel } from "@/features/api-keys/utils/api-key-network.helper";
import type { NetworkType } from "@/types/network.entity";

type ApiKeysSectionHeaderProps = {
  network: NetworkType;
  showRevoked: boolean;
  onShowRevokedChange: (showRevoked: boolean) => void;
  onNetworkChange: (network: NetworkType) => void;
};

export const ApiKeysSectionHeader = ({
  network,
  showRevoked,
  onShowRevokedChange,
  onNetworkChange,
}: ApiKeysSectionHeaderProps) => {
  const networkLabel = getApiKeyNetworkLabel(network);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Machine credentials for {networkLabel}. This network is independent
            of the switch in the header, and keys always use the ESCROW_MANAGER
            role.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="show-revoked-keys"
            checked={showRevoked}
            onCheckedChange={onShowRevokedChange}
          />
          <Label htmlFor="show-revoked-keys" className="text-sm">
            Show revoked
          </Label>
        </div>
      </div>
      <ApiKeysNetworkTabs network={network} onNetworkChange={onNetworkChange} />
    </div>
  );
};

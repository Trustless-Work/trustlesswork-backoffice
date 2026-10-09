"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/shared/Container";
import { DashboardPageHeaderActions } from "@/components/shared/DashboardPageHeaderContext";
import { IntegrationPageTabs } from "@/components/shared/IntegrationPageTabs";
import { Button } from "@/components/ui/button";
import { useApiKeyNetwork } from "@/features/api-keys/hooks/useApiKeyNetwork";
import { getApiKeyNetworkLabel } from "@/features/api-keys/utils/api-key-network.helper";
import { ApiKeysSection } from "@/features/api-keys/ui/ApiKeysSection";
import { CreateApiKeyDialog } from "@/features/api-keys/ui/CreateApiKeyDialog";
import { GeneratedApiKeyDialog } from "@/features/api-keys/ui/GeneratedApiKeyDialog";

export const ApiKeysView = () => {
  const { network, setNetwork, ready } = useApiKeyNetwork();
  const networkLabel = getApiKeyNetworkLabel(network);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);
  const [revealedNetwork, setRevealedNetwork] = useState(network);

  const handleSecretRevealed = (apiKey: string) => {
    setRevealedNetwork(network);
    setRevealedApiKey(apiKey);
  };

  return (
    <>
      <DashboardPageHeaderActions>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:gap-4">
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
          >
            <PlusIcon />
            Generate {networkLabel} key
          </Button>

          <IntegrationPageTabs />
        </div>
      </DashboardPageHeaderActions>

      <Container>
        <ApiKeysSection
          network={network}
          queryEnabled={ready}
          onNetworkChange={setNetwork}
          onCreateRequest={() => setCreateDialogOpen(true)}
          onSecretRevealed={handleSecretRevealed}
        />
      </Container>

      <CreateApiKeyDialog
        network={network}
        onNetworkChange={setNetwork}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleSecretRevealed}
      />

      <GeneratedApiKeyDialog
        network={revealedNetwork}
        apiKey={revealedApiKey}
        onOpenChange={(open) => {
          if (!open) {
            setRevealedApiKey(null);
          }
        }}
      />
    </>
  );
};

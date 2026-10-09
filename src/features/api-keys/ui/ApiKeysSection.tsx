"use client";

import { KeyRoundIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { NoData } from "@/components/shared/NoData";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { useApiKeys } from "@/features/api-keys/hooks/useApiKeys";
import { useRevokeApiKey } from "@/features/api-keys/hooks/useRevokeApiKey";
import { useRotateApiKey } from "@/features/api-keys/hooks/useRotateApiKey";
import { isApiKeyActive } from "@/features/api-keys/types/api-key.types";
import { ApiKeysList } from "@/features/api-keys/ui/ApiKeysList";
import { ApiKeysListSkeleton } from "@/features/api-keys/ui/ApiKeysSkeleton";
import { ApiKeysSectionHeader } from "@/features/api-keys/ui/ApiKeysSectionHeader";
import { RevokeApiKeyDialog } from "@/features/api-keys/ui/RevokeApiKeyDialog";
import { getApiKeyNetworkLabel } from "@/features/api-keys/utils/api-key-network.helper";
import { parseApiError } from "@/lib/api-error";
import type { NetworkType } from "@/types/network.entity";

type ApiKeysSectionProps = {
  network: NetworkType;
  queryEnabled: boolean;
  onNetworkChange: (network: NetworkType) => void;
  onCreateRequest: () => void;
  onSecretRevealed: (apiKey: string) => void;
};

export const ApiKeysSection = ({
  network,
  queryEnabled,
  onNetworkChange,
  onCreateRequest,
  onSecretRevealed,
}: ApiKeysSectionProps) => {
  const networkLabel = getApiKeyNetworkLabel(network);
  const {
    apiKeys,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useApiKeys(network, queryEnabled);
  const [showRevoked, setShowRevoked] = useState(false);
  const {
    mutate: rotateApiKey,
    isPending: isRotating,
    variables: rotatingKey,
  } = useRotateApiKey({ onRotated: onSecretRevealed });
  const {
    mutate: revokeApiKey,
    isPending: isRevoking,
    variables: revokingKey,
  } = useRevokeApiKey();
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const visibleApiKeys = useMemo(
    () =>
      showRevoked ? apiKeys : apiKeys.filter((apiKey) => isApiKeyActive(apiKey)),
    [apiKeys, showRevoked],
  );

  const errorDetail = isError ? parseApiError(error).detail : null;

  const handleConfirmRevoke = () => {
    if (!revokeTarget) {
      return;
    }

    revokeApiKey(
      { keyId: revokeTarget, network },
      {
        onSettled: () => setRevokeTarget(null),
      },
    );
  };

  const showLoading = !queryEnabled || isLoading;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <ApiKeysSectionHeader
            network={network}
            showRevoked={showRevoked}
            onShowRevokedChange={setShowRevoked}
            onNetworkChange={onNetworkChange}
          />
        </CardHeader>
        <CardContent>
          {showLoading ? <ApiKeysListSkeleton /> : null}

          {!showLoading && errorDetail ? (
            <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{errorDetail}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => {
                  void refetch();
                }}
              >
                Try again
              </Button>
            </div>
          ) : null}

          {!showLoading && !errorDetail && visibleApiKeys.length === 0 ? (
            <NoData
              icon={KeyRoundIcon}
              title={
                showRevoked
                  ? `No ${networkLabel} API keys yet`
                  : `No active ${networkLabel} API keys`
              }
              description={
                showRevoked
                  ? `Create a ${networkLabel} key to authenticate your backend with Trustless Work.`
                  : `Create a ${networkLabel} key or enable revoked keys to review past credentials.`
              }
              actionLabel="Create API key"
              onAction={onCreateRequest}
            />
          ) : null}

          {!showLoading && !errorDetail && visibleApiKeys.length > 0 ? (
            <div className="flex flex-col gap-4">
              <ApiKeysList
                apiKeys={visibleApiKeys}
                onRotate={(keyId) => rotateApiKey({ keyId, network })}
                onRevoke={setRevokeTarget}
                rotatingKeyId={
                  isRotating ? (rotatingKey?.keyId ?? null) : null
                }
                revokingKeyId={
                  isRevoking ? (revokingKey?.keyId ?? null) : null
                }
              />
              {hasNextPage ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  disabled={isFetchingNextPage}
                  onClick={() => {
                    void fetchNextPage();
                  }}
                >
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <RevokeApiKeyDialog
        revokeTarget={revokeTarget}
        isRevoking={isRevoking}
        onOpenChange={(open) => {
          if (!open) {
            setRevokeTarget(null);
          }
        }}
        onConfirm={handleConfirmRevoke}
      />
    </>
  );
};

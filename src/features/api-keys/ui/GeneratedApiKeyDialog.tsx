"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiKeyNetworkLabel } from "@/features/api-keys/utils/api-key-network.helper";
import { useCopy } from "@/hooks/useCopy";
import type { NetworkType } from "@/types/network.entity";

type GeneratedApiKeyDialogProps = {
  network: NetworkType;
  apiKey: string | null;
  onOpenChange: (open: boolean) => void;
};

export const GeneratedApiKeyDialog = ({
  network,
  apiKey,
  onOpenChange,
}: GeneratedApiKeyDialogProps) => {
  const { copiedKeyId, copyToClipboard } = useCopy();
  const networkLabel = getApiKeyNetworkLabel(network);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={apiKey !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save your API key</DialogTitle>
          <DialogDescription>
            Copy this {networkLabel} key now. For security, it will not be
            shown again.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
          <code className="flex-1 break-all font-mono text-sm">{apiKey}</code>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Copy API key"
            onClick={() => {
              if (apiKey) {
                void copyToClipboard(apiKey);
              }
            }}
          >
            {copiedKeyId ? (
              <CheckIcon className="text-green-600" />
            ) : (
              <CopyIcon />
            )}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            I have copied it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

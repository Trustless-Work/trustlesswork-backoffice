"use client";

import Link from "next/link";
import { ScanEye, Telescope } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getStellarExpertContractUrl,
  getTrustlessWorkViewerUrl,
} from "@/helpers/escrow-explorer.helper";
import useNetwork from "@/hooks/useNetwork";

type PayrollExplorerLinksProps = {
  contractId: string;
};

const iconLinkClassName =
  "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted";

export const PayrollExplorerLinks = ({
  contractId,
}: PayrollExplorerLinksProps) => {
  const { currentNetwork } = useNetwork();
  const stellarExpertUrl = getStellarExpertContractUrl(
    currentNetwork,
    contractId,
  );
  const trustlessWorkViewerUrl = getTrustlessWorkViewerUrl(
    currentNetwork,
    contractId,
  );

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={stellarExpertUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={iconLinkClassName}
            aria-label="View on Stellar Expert"
          >
            <Telescope className="size-4" aria-hidden="true" />
          </Link>
        </TooltipTrigger>
        <TooltipContent>Stellar Expert</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={trustlessWorkViewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={iconLinkClassName}
            aria-label="View on Trustless Work Viewer"
          >
            <ScanEye className="size-4" aria-hidden="true" />
          </Link>
        </TooltipTrigger>
        <TooltipContent>Trustless Work Viewer</TooltipContent>
      </Tooltip>
    </div>
  );
};

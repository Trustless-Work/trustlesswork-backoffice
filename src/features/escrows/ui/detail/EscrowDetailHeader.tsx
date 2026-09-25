import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { StoredEscrow } from "@/features/escrows/types/escrow.types";
import {
  EscrowStatusBadge,
  EscrowTypeBadge,
} from "@/features/escrows/ui/EscrowStatusBadge";

type EscrowDetailHeaderProps = {
  escrow: StoredEscrow;
  backHref?: string;
  backLabel?: string;
};

export const EscrowDetailHeader = ({
  escrow,
  backHref = "/dashboard/escrows",
  backLabel = "Back to escrows",
}: EscrowDetailHeaderProps) => {
  return (
    <header className="flex items-center justify-between gap-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <div className="flex items-center gap-2">
        <EscrowTypeBadge escrow={escrow} />
        <EscrowStatusBadge escrow={escrow} />
      </div>
    </header>
  );
};

import { Badge } from "@/components/ui/badge";
import { LiveStatusDot, type LiveStatusTone } from "@/components/shared/LiveStatusDot";
import { getEscrowTabConfig } from "@/features/escrows/constants/escrow-tabs";
import type { StoredEscrow } from "@/features/escrows/types/escrow.types";
import {
  getEscrowCardStatusBadgeVariant,
  getEscrowStatusBadgeVariant,
  getEscrowStatusLabel,
  getEscrowTypeLabel,
  isEscrowDisputed,
  isEscrowReleased,
} from "@/features/escrows/utils/escrow-display.helper";
import { cn } from "@/lib/utils";

const activeEscrowStatusBadgeClassName =
  "border-transparent bg-foreground text-background hover:bg-foreground/90";

function isEscrowActive(escrow: StoredEscrow): boolean {
  return !isEscrowDisputed(escrow) && !isEscrowReleased(escrow);
}

function getEscrowStatusTone(escrow: StoredEscrow): LiveStatusTone {
  if (isEscrowDisputed(escrow)) {
    return "disputed";
  }

  if (isEscrowReleased(escrow)) {
    return "released";
  }

  return "active";
}

function getEscrowCardStatusTone(
  status: "active" | "released" | "disputed",
): LiveStatusTone {
  return status;
}

type EscrowStatusBadgeProps = {
  escrow: StoredEscrow;
  className?: string;
};

export const EscrowStatusBadge = ({
  escrow,
  className,
}: EscrowStatusBadgeProps) => {
  const isActive = isEscrowActive(escrow);

  return (
    <Badge
      variant={isActive ? "outline" : getEscrowStatusBadgeVariant(escrow)}
      className={cn(
        "gap-1.5 uppercase",
        isActive && activeEscrowStatusBadgeClassName,
        className,
      )}
    >
      <LiveStatusDot tone={getEscrowStatusTone(escrow)} />
      {getEscrowStatusLabel(escrow)}
    </Badge>
  );
};

type EscrowCardStatusBadgeProps = {
  status: "active" | "released" | "disputed";
  className?: string;
};

export const EscrowCardStatusBadge = ({
  status,
  className,
}: EscrowCardStatusBadgeProps) => {
  const isActive = status === "active";

  return (
    <Badge
      variant={isActive ? "outline" : getEscrowCardStatusBadgeVariant(status)}
      className={cn(
        "gap-1.5 uppercase",
        isActive && activeEscrowStatusBadgeClassName,
        className,
      )}
    >
      <LiveStatusDot tone={getEscrowCardStatusTone(status)} />
      {status === "active"
        ? "Active"
        : status === "released"
          ? "Released"
          : "Disputed"}
    </Badge>
  );
};

type EscrowApiVersionBadgeProps = {
  apiVersion: string | null | undefined;
  className?: string;
};

export const EscrowApiVersionBadge = ({
  apiVersion,
  className,
}: EscrowApiVersionBadgeProps) => {
  const version = apiVersion?.trim();
  if (!version) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      title="API version"
      className={cn("font-mono font-normal uppercase", className)}
    >
      API {version}
    </Badge>
  );
};

type EscrowTypeBadgeProps = {
  escrow: StoredEscrow;
  className?: string;
};

export const EscrowTypeBadge = ({ escrow, className }: EscrowTypeBadgeProps) => {
  const { icon: TypeIcon } = getEscrowTabConfig(escrow.type);

  return (
    <Badge variant="outline" className={cn("gap-1.5 uppercase", className)}>
      <TypeIcon className="size-4 shrink-0" aria-hidden="true" />
      {getEscrowTypeLabel(escrow.type)}
    </Badge>
  );
};

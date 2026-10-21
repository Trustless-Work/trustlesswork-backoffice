"use client";

import { createElement } from "react";
import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ROLE_LABELS,
  capitalizeLabel,
  getEscrowRoleFilterIcon,
} from "@/features/escrows/ui/escrow-filter-labels";
import type {
  EscrowListFilters,
  EscrowRoleFilter,
} from "@/features/escrows/types/escrow.types";

type RoleFilterIconProps = {
  role: EscrowRoleFilter;
  className?: string;
};

const RoleFilterIcon = ({ role, className }: RoleFilterIconProps) =>
  createElement(getEscrowRoleFilterIcon(role), { className });

type EscrowActiveFilterChipsProps = {
  draft: EscrowListFilters;
  onClearStatus: () => void;
  onClearEngagement: () => void;
  onClearParticipant: () => void;
  onClearRole: () => void;
  onClearCreatedRange: () => void;
};

export const EscrowActiveFilterChips = ({
  draft,
  onClearStatus,
  onClearEngagement,
  onClearParticipant,
  onClearRole,
  onClearCreatedRange,
}: EscrowActiveFilterChipsProps) => (
  <div className="mt-3 flex flex-wrap gap-2">
    {draft.status ? (
      <Badge variant="outline" className="gap-1 capitalize">
        Status: {capitalizeLabel(draft.status)}
        <button type="button" aria-label="Clear status" onClick={onClearStatus}>
          <XIcon className="size-3" />
        </button>
      </Badge>
    ) : null}
    {draft.engagementId.trim() ? (
      <Badge variant="outline" className="gap-1 capitalize">
        Engagement: {draft.engagementId}
        <button
          type="button"
          aria-label="Clear engagement"
          onClick={onClearEngagement}
        >
          <XIcon className="size-3" />
        </button>
      </Badge>
    ) : null}
    {draft.participant.trim() ? (
      <Badge variant="outline" className="gap-1 capitalize">
        Participant
        <button
          type="button"
          aria-label="Clear participant"
          onClick={onClearParticipant}
        >
          <XIcon className="size-3" />
        </button>
      </Badge>
    ) : null}
    {draft.role ? (
      <Badge variant="outline" className="gap-1 capitalize">
        <RoleFilterIcon role={draft.role} className="size-3.5" />
        {ROLE_LABELS[draft.role]}
        <button type="button" aria-label="Clear role" onClick={onClearRole}>
          <XIcon className="size-3" />
        </button>
      </Badge>
    ) : null}
    {draft.createdAfter || draft.createdBefore ? (
      <Badge variant="outline" className="gap-1 capitalize">
        Created Range
        <button
          type="button"
          aria-label="Clear created range"
          onClick={onClearCreatedRange}
        >
          <XIcon className="size-3" />
        </button>
      </Badge>
    ) : null}
  </div>
);

"use client";

import { RotateCcwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEscrowListSearchParams } from "@/features/escrows/hooks/useEscrowListSearchParams";
import { EscrowActiveFilterChips } from "@/features/escrows/ui/EscrowActiveFilterChips";
import { EscrowCreatedRangeFilter } from "@/features/escrows/ui/EscrowCreatedRangeFilter";
import {
  ANY_ROLE_FILTER_ICON,
  ROLE_LABELS,
  capitalizeLabel,
  getEscrowRoleFilterIcon,
} from "@/features/escrows/ui/escrow-filter-labels";
import {
  ESCROW_ROLES,
  ESCROW_SORT_FIELDS,
  ESCROW_STATUSES,
  type EscrowRoleFilter,
  type EscrowScope,
  type EscrowSortField,
  type EscrowSortOrder,
  type EscrowStatus,
} from "@/features/escrows/types/escrow.types";

export { EscrowFiltersBarSkeleton } from "@/features/escrows/ui/EscrowFiltersBarSkeleton";

const FILTER_CONTROL_CLASSNAME =
  "h-9 w-full rounded-4xl border-border bg-background dark:bg-transparent dark:hover:bg-input/30";

export const EscrowFiltersBar = () => {
  const {
    draft,
    setFilter,
    setFilters,
    setTextFilter,
    resetFilters,
    activeFilterCount,
  } = useEscrowListSearchParams();

  return (
    <div className="rounded-xl border border-border bg-card p-3 md:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium capitalize">Filters</p>
          {activeFilterCount > 0 ? (
            <Badge variant="secondary" className="capitalize">
              {activeFilterCount} Active
            </Badge>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="capitalize"
          onClick={resetFilters}
          disabled={activeFilterCount === 0}
        >
          <RotateCcwIcon className="size-3.5" />
          Clear
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-[1.25] space-y-1.5">
          <Label htmlFor="escrow-status" className="capitalize">
            Status
          </Label>
          <Select
            value={draft.status ?? "all"}
            onValueChange={(value) =>
              setFilter(
                "status",
                value === "all" ? undefined : (value as EscrowStatus),
              )
            }
          >
            <SelectTrigger id="escrow-status" className={`${FILTER_CONTROL_CLASSNAME} capitalize`}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="capitalize">
                All Statuses
              </SelectItem>
              {ESCROW_STATUSES.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="capitalize"
                >
                  {capitalizeLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <Label htmlFor="escrow-scope" className="capitalize">
            Scope
          </Label>
          <Select
            value={draft.scope}
            onValueChange={(value) => setFilter("scope", value as EscrowScope)}
          >
            <SelectTrigger id="escrow-scope" className={`${FILTER_CONTROL_CLASSNAME} capitalize`}>
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mine" className="capitalize">
                My Escrows
              </SelectItem>
              <SelectItem value="all" className="capitalize">
                All Escrows
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid min-w-0 flex-[0.95] grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="escrow-sort" className="capitalize">
              Sort By
            </Label>
            <Select
              value={draft.sort}
              onValueChange={(value) =>
                setFilter("sort", value as EscrowSortField)
              }
            >
              <SelectTrigger id="escrow-sort" className={`${FILTER_CONTROL_CLASSNAME} capitalize`}>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {ESCROW_SORT_FIELDS.map((field) => (
                  <SelectItem key={field} value={field} className="capitalize">
                    {field === "createdAt" ? "Created" : "Updated"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="escrow-order" className="capitalize">
              Order
            </Label>
            <Select
              value={draft.order}
              onValueChange={(value) =>
                setFilter("order", value as EscrowSortOrder)
              }
            >
              <SelectTrigger id="escrow-order" className={`${FILTER_CONTROL_CLASSNAME} capitalize`}>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc" className="capitalize">
                  Newest First
                </SelectItem>
                <SelectItem value="asc" className="capitalize">
                  Oldest First
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-[1.75] space-y-1.5">
          <Label htmlFor="escrow-participant" className="capitalize">
            Participant
          </Label>
          <Input
            id="escrow-participant"
            value={draft.participant}
            onChange={(event) =>
              setTextFilter("participant", event.target.value)
            }
            placeholder="G…"
            className={`${FILTER_CONTROL_CLASSNAME} font-mono text-sm`}
          />
        </div>

        <div className="min-w-0 flex-[0.9] space-y-1.5">
          <Label htmlFor="escrow-engagement" className="capitalize">
            Engagement ID
          </Label>
          <Input
            id="escrow-engagement"
            value={draft.engagementId}
            onChange={(event) =>
              setTextFilter("engagementId", event.target.value)
            }
            placeholder="ENG-123"
            className={FILTER_CONTROL_CLASSNAME}
          />
        </div>

        <div className="min-w-0 flex-[1.35]">
          <EscrowCreatedRangeFilter
            createdAfter={draft.createdAfter}
            createdBefore={draft.createdBefore}
            onChange={({ createdAfter, createdBefore }) => {
              setFilters((prev) => ({
                ...prev,
                createdAfter,
                createdBefore,
              }));
            }}
          />
        </div>

        <div className="min-w-0 flex-[0.9] space-y-1.5 lg:max-w-56">
          <Label htmlFor="escrow-role" className="capitalize">
            Role
          </Label>
          <Select
            value={draft.role ?? "any"}
            onValueChange={(value) =>
              setFilter(
                "role",
                value === "any" ? undefined : (value as EscrowRoleFilter),
              )
            }
          >
            <SelectTrigger
              id="escrow-role"
              className={`${FILTER_CONTROL_CLASSNAME} capitalize`}
            >
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any" className="capitalize">
                <ANY_ROLE_FILTER_ICON className="size-4 text-muted-foreground" />
                Any Role
              </SelectItem>
              {ESCROW_ROLES.map((role) => {
                const Icon = getEscrowRoleFilterIcon(role);

                return (
                  <SelectItem key={role} value={role} className="capitalize">
                    <Icon className="size-4 text-muted-foreground" />
                    {ROLE_LABELS[role]}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilterCount > 0 ? (
        <EscrowActiveFilterChips
          draft={draft}
          onClearStatus={() => setFilter("status", undefined)}
          onClearEngagement={() => setTextFilter("engagementId", "")}
          onClearParticipant={() => setTextFilter("participant", "")}
          onClearRole={() => setFilter("role", undefined)}
          onClearCreatedRange={() =>
            setFilters((prev) => ({
              ...prev,
              createdAfter: "",
              createdBefore: "",
            }))
          }
        />
      ) : null}
    </div>
  );
};

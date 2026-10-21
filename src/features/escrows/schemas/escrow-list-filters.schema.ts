import { z } from "zod";
import {
  DEFAULT_ESCROW_LIST_FILTERS,
  ESCROW_ROLES,
  ESCROW_SCOPES,
  ESCROW_SORT_FIELDS,
  ESCROW_SORT_ORDERS,
  ESCROW_STATUSES,
  ESCROW_TYPES,
  type EscrowListFilters,
} from "@/features/escrows/types/escrow.types";

function emptyToUndefined(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  return value.trim();
}

export const escrowListFiltersSchema = z.object({
  type: z.enum(ESCROW_TYPES).default(DEFAULT_ESCROW_LIST_FILTERS.type),
  scope: z.enum(ESCROW_SCOPES).default(DEFAULT_ESCROW_LIST_FILTERS.scope),
  status: z.enum(ESCROW_STATUSES).optional(),
  engagementId: z.string().default(""),
  contractIds: z.array(z.string().min(1)).default([]),
  participant: z.string().default(""),
  role: z.enum(ESCROW_ROLES).optional(),
  platformId: z.string().default(""),
  subjectId: z.string().default(""),
  createdAfter: z.string().default(""),
  createdBefore: z.string().default(""),
  sort: z.enum(ESCROW_SORT_FIELDS).default(DEFAULT_ESCROW_LIST_FILTERS.sort),
  order: z.enum(ESCROW_SORT_ORDERS).default(DEFAULT_ESCROW_LIST_FILTERS.order),
});

export type EscrowListFiltersSchema = z.infer<typeof escrowListFiltersSchema>;

export function parseContractIdsParam(
  value: string | null | undefined,
): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseEscrowListFiltersFromSearchParams(
  params: URLSearchParams,
): EscrowListFilters {
  const parsed = escrowListFiltersSchema.safeParse({
    type: params.get("type") ?? undefined,
    scope: params.get("scope") ?? undefined,
    status: emptyToUndefined(params.get("status") ?? undefined),
    engagementId: params.get("engagementId") ?? "",
    contractIds: parseContractIdsParam(params.get("contractIds")),
    participant: params.get("participant") ?? "",
    role: emptyToUndefined(params.get("role") ?? undefined),
    platformId: params.get("platformId") ?? "",
    subjectId: params.get("subjectId") ?? "",
    createdAfter: params.get("createdAfter") ?? "",
    createdBefore: params.get("createdBefore") ?? "",
    sort: params.get("sort") ?? undefined,
    order: params.get("order") ?? undefined,
  });

  if (!parsed.success) {
    return { ...DEFAULT_ESCROW_LIST_FILTERS };
  }

  return {
    type: parsed.data.type,
    scope: parsed.data.scope,
    status: parsed.data.status,
    engagementId: parsed.data.engagementId,
    contractIds: parsed.data.contractIds,
    participant: parsed.data.participant,
    role: parsed.data.role,
    platformId: parsed.data.platformId,
    subjectId: parsed.data.subjectId,
    createdAfter: parsed.data.createdAfter,
    createdBefore: parsed.data.createdBefore,
    sort: parsed.data.sort,
    order: parsed.data.order,
  };
}

export function escrowListFiltersToSearchParams(
  filters: EscrowListFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  const defaults = DEFAULT_ESCROW_LIST_FILTERS;

  if (filters.type !== defaults.type) {
    params.set("type", filters.type);
  }

  if (filters.scope !== defaults.scope) {
    params.set("scope", filters.scope);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.engagementId.trim()) {
    params.set("engagementId", filters.engagementId.trim());
  }

  if (filters.contractIds.length > 0) {
    params.set("contractIds", filters.contractIds.join(","));
  }

  if (filters.participant.trim()) {
    params.set("participant", filters.participant.trim());
  }

  if (filters.role) {
    params.set("role", filters.role);
  }

  if (filters.platformId.trim()) {
    params.set("platformId", filters.platformId.trim());
  }

  if (filters.subjectId.trim()) {
    params.set("subjectId", filters.subjectId.trim());
  }

  if (filters.createdAfter.trim()) {
    params.set("createdAfter", filters.createdAfter.trim());
  }

  if (filters.createdBefore.trim()) {
    params.set("createdBefore", filters.createdBefore.trim());
  }

  if (filters.sort !== defaults.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.order !== defaults.order) {
    params.set("order", filters.order);
  }

  return params;
}

export function countActiveEscrowFilters(filters: EscrowListFilters): number {
  const defaults = DEFAULT_ESCROW_LIST_FILTERS;
  let count = 0;

  if (filters.scope !== defaults.scope) count += 1;
  if (filters.status) count += 1;
  if (filters.engagementId.trim()) count += 1;
  if (filters.contractIds.length > 0) count += 1;
  if (filters.participant.trim()) count += 1;
  if (filters.role) count += 1;
  if (filters.platformId.trim()) count += 1;
  if (filters.subjectId.trim()) count += 1;
  if (filters.createdAfter.trim() || filters.createdBefore.trim()) count += 1;
  if (filters.sort !== defaults.sort) count += 1;
  if (filters.order !== defaults.order) count += 1;

  return count;
}

import type { ListEscrowsParams } from "@trustless-work/escrow";
import type {
  EscrowListFilters,
  EscrowType,
} from "@/features/escrows/types/escrow.types";
import { DEFAULT_KEYSET_LIMIT } from "@/types/pagination.entity";

export type EscrowListRequestParams = Omit<ListEscrowsParams, "contractType"> & {
  type?: EscrowType;
};

export function toRestListParams(
  filters: EscrowListFilters,
  options?: {
    cursor?: string;
    limit?: number;
  },
): EscrowListRequestParams {
  const params: EscrowListRequestParams = {
    scope: filters.scope,
    type: filters.type,
    sort: filters.sort,
    order: filters.order,
    limit: options?.limit ?? DEFAULT_KEYSET_LIMIT,
  };

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.engagementId.trim()) {
    params.engagementId = filters.engagementId.trim();
  }

  if (filters.contractIds.length > 0) {
    params.contractIds = filters.contractIds;
  }

  if (filters.participant.trim()) {
    params.participant = filters.participant.trim();
  }

  if (filters.role) {
    params.role = filters.role;
  }

  if (filters.platformId.trim()) {
    params.platformId = filters.platformId.trim();
  }

  if (filters.subjectId.trim()) {
    params.subjectId = filters.subjectId.trim();
  }

  if (filters.createdAfter.trim()) {
    params.createdAfter = filters.createdAfter.trim();
  }

  if (filters.createdBefore.trim()) {
    params.createdBefore = filters.createdBefore.trim();
  }

  if (options?.cursor) {
    params.cursor = options.cursor;
  }

  return params;
}

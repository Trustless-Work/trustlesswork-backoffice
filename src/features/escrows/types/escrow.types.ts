import type {
  EscrowDeposit,
  EscrowEvent,
  EscrowFinancial,
  MultiReleaseEscrow,
  SingleReleaseEscrow,
} from "@trustless-work/escrow";

export const ESCROW_TYPES = ["single-release", "multi-release"] as const;

export type EscrowType = (typeof ESCROW_TYPES)[number];

export function isEscrowType(value: string): value is EscrowType {
  return ESCROW_TYPES.includes(value as EscrowType);
}

export const ESCROW_STATUSES = ["active", "released", "disputed"] as const;

export type EscrowStatus = (typeof ESCROW_STATUSES)[number];

export function isEscrowStatus(value: string): value is EscrowStatus {
  return ESCROW_STATUSES.includes(value as EscrowStatus);
}

export const ESCROW_SCOPES = ["mine", "all"] as const;

export type EscrowScope = (typeof ESCROW_SCOPES)[number];

export const ESCROW_SORT_FIELDS = ["createdAt", "updatedAt"] as const;

export type EscrowSortField = (typeof ESCROW_SORT_FIELDS)[number];

export const ESCROW_SORT_ORDERS = ["asc", "desc"] as const;

export type EscrowSortOrder = (typeof ESCROW_SORT_ORDERS)[number];

export const ESCROW_ROLES = [
  "approver",
  "serviceProvider",
  "platform",
  "releaseSigner",
  "disputeResolver",
  "receiver",
  "admin",
  "observer",
  "signer",
] as const;

export type EscrowRoleFilter = (typeof ESCROW_ROLES)[number];

export type StoredEscrowMetadata = {
  readonly contractId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly status?: EscrowStatus | string | null;
  readonly apiVersion?: string | null;
};

export type StoredSingleReleaseEscrow = SingleReleaseEscrow &
  StoredEscrowMetadata & {
    readonly type: "single-release";
  };

export type StoredMultiReleaseEscrow = MultiReleaseEscrow &
  StoredEscrowMetadata & {
    readonly type: "multi-release";
  };

export type StoredEscrow = StoredSingleReleaseEscrow | StoredMultiReleaseEscrow;

export function isStoredSingleReleaseEscrow(
  escrow: StoredEscrow,
): escrow is StoredSingleReleaseEscrow {
  return escrow.type === "single-release";
}

export function isStoredMultiReleaseEscrow(
  escrow: StoredEscrow,
): escrow is StoredMultiReleaseEscrow {
  return escrow.type === "multi-release";
}

/** @deprecated Prefer EscrowStatus omit for "all" via undefined */
export type EscrowFilterStatus = "all" | EscrowStatus;

export type EscrowListFilters = {
  type: EscrowType;
  scope: EscrowScope;
  status?: EscrowStatus;
  engagementId: string;
  contractIds: string[];
  participant: string;
  role?: EscrowRoleFilter;
  platformId: string;
  subjectId: string;
  createdAfter: string;
  createdBefore: string;
  sort: EscrowSortField;
  order: EscrowSortOrder;
};

export const DEFAULT_ESCROW_LIST_FILTERS: EscrowListFilters = {
  type: "single-release",
  scope: "mine",
  status: undefined,
  engagementId: "",
  contractIds: [],
  participant: "",
  role: undefined,
  platformId: "",
  subjectId: "",
  createdAfter: "",
  createdBefore: "",
  sort: "createdAt",
  order: "desc",
};

/** @deprecated Use EscrowListFilters */
export type EscrowFilters = {
  search: string;
  status: EscrowFilterStatus;
};

/** @deprecated Use DEFAULT_ESCROW_LIST_FILTERS */
export const DEFAULT_ESCROW_FILTERS: EscrowFilters = {
  search: "",
  status: "all",
};

export type EscrowCardLayout = "featured" | "emphasis" | "standard" | "compact";

export type EscrowListItem = {
  readonly contractId: string;
  readonly type: EscrowType;
  readonly status: EscrowStatus | string | null;
  readonly engagementId: string | null;
  readonly title: string;
  readonly description: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly amount: number | null;
  readonly balance: number;
  readonly assetSymbol: string;
  readonly milestoneCount: number;
  readonly financial: EscrowFinancial | null;
  readonly stored: StoredEscrow;
  readonly layout: EscrowCardLayout;
};

export type EscrowDetailModel = {
  readonly escrow: StoredEscrow;
  readonly amount: number | null;
  readonly status: EscrowStatus | string | null;
  readonly financial: EscrowFinancial | null;
  readonly deposits: readonly EscrowDeposit[];
  readonly events: readonly EscrowEvent[];
};

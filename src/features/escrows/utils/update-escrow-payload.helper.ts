import type {
  MultiReleaseRoles,
  Roles,
  Trustline,
  UpdateMultiReleaseEscrowPayload,
  UpdateSingleReleaseEscrowPayload,
} from "@trustless-work/escrow";
import { trustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";
import type { UpdateEscrowFormData } from "@/features/escrows/schemas/escrow-action.schemas";
import type {
  StoredEscrow,
  StoredMultiReleaseEscrow,
  StoredSingleReleaseEscrow,
} from "@/features/escrows/types/escrow.types";
import {
  isStoredMultiReleaseEscrow,
  isStoredSingleReleaseEscrow,
} from "@/features/escrows/types/escrow.types";

function buildTrustlineDefaults(escrow: StoredEscrow): {
  isCustom: boolean;
  address: string;
  symbol: string;
} {
  const candidates = [
    escrow.trustline.contractId,
    escrow.trustline.address,
  ].filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );

  const matched = trustlineOptions.find((option) =>
    candidates.some((candidate) => candidate === option.value),
  );

  if (matched) {
    return {
      isCustom: false,
      address: matched.value,
      symbol: matched.label,
    };
  }

  return {
    isCustom: true,
    address: candidates[0] ?? "",
    symbol: escrow.trustline.symbol ?? "",
  };
}

function buildBaseRolesDefaults(escrow: StoredEscrow) {
  return {
    approvers: [...escrow.roles.approvers],
    serviceProviders: [...escrow.roles.serviceProviders],
    platform: escrow.roles.platform,
    releaseSigners: [...escrow.roles.releaseSigners],
    disputeResolvers: [...escrow.roles.disputeResolvers],
    admin: escrow.roles.admin,
    observers: [...(escrow.roles.observers ?? [])],
  };
}

export function buildUpdateEscrowDefaultValues(
  escrow: StoredEscrow,
): UpdateEscrowFormData {
  const trustline = buildTrustlineDefaults(escrow);

  if (isStoredMultiReleaseEscrow(escrow)) {
    return {
      type: "multi-release",
      engagementId: escrow.engagementId,
      title: escrow.title,
      description: escrow.description,
      platformFee: escrow.platformFee,
      roles: buildBaseRolesDefaults(escrow),
      trustline,
    };
  }

  return {
    type: "single-release",
    engagementId: escrow.engagementId,
    title: escrow.title,
    description: escrow.description,
    amount: escrow.amount,
    platformFee: escrow.platformFee,
    roles: {
      ...buildBaseRolesDefaults(escrow),
      receiver: escrow.roles.receiver,
    },
    trustline,
  };
}

function buildTrustlinePayload(values: UpdateEscrowFormData): Trustline {
  const contractId = values.trustline.address.trim();

  return {
    address: contractId,
    symbol: values.trustline.symbol.trim(),
    contractId,
  };
}

function buildSingleReleasePayload(
  escrow: StoredSingleReleaseEscrow,
  values: Extract<UpdateEscrowFormData, { type: "single-release" }>,
): UpdateSingleReleaseEscrowPayload {
  const roles: Roles = {
    approvers: values.roles.approvers,
    serviceProviders: values.roles.serviceProviders,
    platform: escrow.roles.platform,
    releaseSigners: values.roles.releaseSigners,
    disputeResolvers: values.roles.disputeResolvers,
    receiver: values.roles.receiver,
    admin: escrow.roles.admin,
    observers: values.roles.observers,
  };

  return {
    contractId: escrow.contractId,
    admin: escrow.roles.admin,
    escrow: {
      engagementId: values.engagementId.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      amount: values.amount,
      platformFee: values.platformFee,
      roles,
      milestones: escrow.milestones.map((milestone) => ({
        description: milestone.description,
        status: milestone.status,
        approvalsTarget: milestone.approvalsTarget ?? 1,
      })),
      trustline: buildTrustlinePayload(values),
    },
  };
}

function buildMultiReleasePayload(
  escrow: StoredMultiReleaseEscrow,
  values: Extract<UpdateEscrowFormData, { type: "multi-release" }>,
): UpdateMultiReleaseEscrowPayload {
  const roles: MultiReleaseRoles = {
    approvers: values.roles.approvers,
    serviceProviders: values.roles.serviceProviders,
    platform: escrow.roles.platform,
    releaseSigners: values.roles.releaseSigners,
    disputeResolvers: values.roles.disputeResolvers,
    admin: escrow.roles.admin,
    observers: values.roles.observers,
  };

  return {
    contractId: escrow.contractId,
    admin: escrow.roles.admin,
    escrow: {
      engagementId: values.engagementId.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      platformFee: values.platformFee,
      roles,
      milestones: escrow.milestones.map((milestone) => ({
        description: milestone.description,
        status: milestone.status,
        approvalsTarget: milestone.approvalsTarget ?? 1,
        amount: milestone.amount,
        receiver: milestone.receiver,
      })),
      trustline: buildTrustlinePayload(values),
    },
  };
}

export function buildUpdateEscrowPayload(
  escrow: StoredEscrow,
  values: UpdateEscrowFormData,
): UpdateSingleReleaseEscrowPayload | UpdateMultiReleaseEscrowPayload {
  if (isStoredSingleReleaseEscrow(escrow) && values.type === "single-release") {
    return buildSingleReleasePayload(escrow, values);
  }

  if (isStoredMultiReleaseEscrow(escrow) && values.type === "multi-release") {
    return buildMultiReleasePayload(escrow, values);
  }

  throw new Error("Escrow type does not match update form data");
}

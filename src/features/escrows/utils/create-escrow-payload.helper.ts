import type {
  DeployMultiReleaseEscrowPayload,
  DeploySingleReleaseEscrowPayload,
} from "@trustless-work/escrow";
import type {
  CreateEscrowFormData,
  MultiReleaseCreateFormData,
  SingleReleaseCreateFormData,
} from "@/features/escrows/schemas/create-escrow.schema";

export function toDeployPayload(
  values: CreateEscrowFormData,
  signer: string,
): DeploySingleReleaseEscrowPayload | DeployMultiReleaseEscrowPayload {
  const rolesBase = {
    approvers: values.roles.approvers,
    serviceProviders: values.roles.serviceProviders,
    platform: values.roles.platform,
    releaseSigners: values.roles.releaseSigners,
    disputeResolvers: values.roles.disputeResolvers,
    admin: values.roles.admin,
    observers: values.roles.observers,
  };

  const trustline = {
    contractId: values.trustline.address.trim(),
    symbol: values.trustline.symbol.trim(),
  };

  if (values.type === "multi-release") {
    const multiValues = values as MultiReleaseCreateFormData;

    return {
      signer,
      engagementId: multiValues.engagementId,
      title: multiValues.title,
      description: multiValues.description,
      platformFee: multiValues.platformFee,
      roles: rolesBase,
      milestones: multiValues.milestones.map((milestone) => ({
        description: milestone.description,
        approvalsTarget: milestone.approvalsTarget,
        amount: milestone.amount,
        receiver: milestone.receiver,
      })),
      trustline,
    };
  }

  const singleValues = values as SingleReleaseCreateFormData;

  return {
    signer,
    engagementId: singleValues.engagementId,
    title: singleValues.title,
    description: singleValues.description,
    amount: singleValues.amount,
    platformFee: singleValues.platformFee,
    roles: {
      ...rolesBase,
      receiver: singleValues.roles.receiver,
    },
    milestones: singleValues.milestones.map((milestone) => ({
      description: milestone.description,
      approvalsTarget: milestone.approvalsTarget,
    })),
    trustline,
  };
}

/** @deprecated Use `toDeployPayload` */
export const toInitializePayload = toDeployPayload;

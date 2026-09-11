import { trustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";
import type {
  CreateEscrowFormData,
  CreateEscrowMilestoneFormData,
  SingleReleaseCreateFormData,
} from "@/features/escrows/schemas/create-escrow.schema";
import type { EscrowType } from "@/features/escrows/types/escrow.types";

const defaultTrustline = trustlineOptions[0];

export const TEMPLATE_DISPUTE_RESOLVER =
  "GCWTL5XN22BWFB6QSF4SKYKFQP3G3KTEHUFK7HR7CGRQJFVCO2WVXVLE";

export const TEMPLATE_ADMIN =
  "GCK27OWIRLRVHGFOOO67SF5NL2LD5WIQSFAT5MMFEF7AGUOREUL7SBSX";

export function buildDefaultRoles(
  walletAddress: string,
): SingleReleaseCreateFormData["roles"] {
  const address = walletAddress || "";

  return {
    approvers: [address],
    serviceProviders: [address],
    platform: address,
    releaseSigners: [address],
    disputeResolvers: [address],
    receiver: address,
    admin: address,
    observers: [],
  };
}

export function getDefaultValues(
  type: EscrowType,
  walletAddress: string,
): CreateEscrowFormData {
  const roles = buildDefaultRoles(walletAddress);
  const trustline = {
    isCustom: false,
    address: defaultTrustline?.value ?? "",
    symbol: defaultTrustline?.label ?? "USDC",
  };

  if (type === "multi-release") {
    return {
      type: "multi-release",
      engagementId: "",
      title: "",
      description: "",
      platformFee: 2,
      roles: {
        approvers: roles.approvers,
        serviceProviders: roles.serviceProviders,
        platform: roles.platform,
        releaseSigners: roles.releaseSigners,
        disputeResolvers: roles.disputeResolvers,
        admin: roles.admin,
        observers: roles.observers,
      },
      milestones: [
        {
          description: "",
          approvalsTarget: 1,
          amount: 0,
          receiver: walletAddress,
        },
      ],
      trustline,
    };
  }

  return {
    type: "single-release",
    engagementId: "",
    title: "",
    description: "",
    amount: 0,
    platformFee: 2,
    roles,
    milestones: [{ description: "", approvalsTarget: 1 }],
    trustline,
  };
}

export function buildTemplateValues(
  type: EscrowType,
  walletAddress: string,
): CreateEscrowFormData {
  const roles = {
    ...buildDefaultRoles(walletAddress),
    disputeResolvers: [TEMPLATE_DISPUTE_RESOLVER],
    admin: TEMPLATE_ADMIN,
  };
  const trustline = {
    isCustom: false,
    address: defaultTrustline?.value ?? "",
    symbol: defaultTrustline?.label ?? "USDC",
  };

  if (type === "multi-release") {
    return {
      type: "multi-release",
      engagementId: `eng-multi-${Date.now()}`,
      title: "Multi-release project template",
      description:
        "Milestone-based payments released independently as work is approved.",
      platformFee: 2,
      roles: {
        approvers: roles.approvers,
        serviceProviders: roles.serviceProviders,
        platform: roles.platform,
        releaseSigners: roles.releaseSigners,
        disputeResolvers: roles.disputeResolvers,
        admin: roles.admin,
        observers: roles.observers,
      },
      milestones: [
        {
          description: "Discovery and planning deliverables",
          approvalsTarget: 1,
          amount: 250,
          receiver: walletAddress,
        },
        {
          description: "Implementation and QA",
          approvalsTarget: 1,
          amount: 750,
          receiver: walletAddress,
        },
      ],
      trustline,
    };
  }

  return {
    type: "single-release",
    engagementId: `eng-single-${Date.now()}`,
    title: "Single-release service template",
    description:
      "One escrow with multiple milestones and a single payout once all are approved.",
    amount: 1000,
    platformFee: 2,
    roles: {
      ...roles,
      approvers: walletAddress ? [walletAddress] : [""],
    },
    milestones: [
      {
        description: "Initial delivery and review",
        approvalsTarget: 1,
      },
      {
        description: "Final acceptance",
        approvalsTarget: 1,
      },
    ],
    trustline,
  };
}

export function migrateFormValues(
  current: CreateEscrowFormData,
  nextType: EscrowType,
  walletAddress: string,
): CreateEscrowFormData {
  const shared = {
    engagementId: current.engagementId,
    title: current.title,
    description: current.description,
    platformFee: current.platformFee,
    trustline: current.trustline,
  };

  const rolesBase = {
    approvers: current.roles.approvers,
    serviceProviders: current.roles.serviceProviders,
    platform: current.roles.platform,
    releaseSigners: current.roles.releaseSigners,
    disputeResolvers: current.roles.disputeResolvers,
    admin: current.roles.admin,
    observers: current.roles.observers ?? [],
  };

  if (nextType === "multi-release") {
    const receiver =
      current.type === "single-release"
        ? current.roles.receiver
        : walletAddress;

    return {
      type: "multi-release",
      ...shared,
      roles: rolesBase,
      milestones: current.milestones.map(
        (milestone: CreateEscrowMilestoneFormData) => ({
          description: milestone.description,
          approvalsTarget: milestone.approvalsTarget,
          amount:
            "amount" in milestone && typeof milestone.amount === "number"
              ? milestone.amount
              : 0,
          receiver,
        }),
      ),
    };
  }

  const receiver =
    current.type === "single-release" ? current.roles.receiver : walletAddress;
  const amount = current.type === "single-release" ? current.amount : 0;

  return {
    type: "single-release",
    ...shared,
    amount,
    roles: {
      ...rolesBase,
      receiver,
    },
    milestones: current.milestones.map(
      (milestone: CreateEscrowMilestoneFormData) => ({
        description: milestone.description,
        approvalsTarget: milestone.approvalsTarget,
      }),
    ),
  };
}

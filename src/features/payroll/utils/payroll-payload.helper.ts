import type { DeployMultiReleaseEscrowPayload } from "@trustless-work/escrow";
import { trustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";
import {
  PAYROLL_PLATFORM_FEE,
  PAYROLL_TEST_MILESTONE_AMOUNT,
} from "@/features/payroll/constants/payroll.constants";
import { PAYROLL_ALBERTO_EMAIL } from "@/features/payroll/constants/team.constants";
import type { PayrollRunFormData } from "@/features/payroll/schemas/payroll-run.schema";
import {
  TEMPLATE_ADMIN,
  TEMPLATE_DISPUTE_RESOLVER,
} from "@/features/escrows/utils/create-escrow-form.helper";
import {
  buildMilestoneDescription,
  buildPayrollDescription,
  buildPayrollEngagementId,
  buildPayrollTitle,
  buildTestMilestoneDescription,
  type PayrollPeriod,
} from "@/features/payroll/utils/payroll-naming.helper";
import { getStoredNetwork } from "@/lib/client-storage";
import { clientEnv } from "@/lib/env";
import type { NetworkType } from "@/types/network.entity";

const defaultTrustline = trustlineOptions[0];

type PayrollRolesOptions = {
  readonly adminAddress?: string;
};

export function resolvePayrollDisputeResolver(
  network: NetworkType = getStoredNetwork(),
): string | undefined {
  if (network === "testnet") {
    return TEMPLATE_DISPUTE_RESOLVER;
  }

  return clientEnv.payroll.disputeResolver;
}

export function buildPayrollRoles(
  included: PayrollRunFormData["members"],
  disputeResolver: string,
  options: PayrollRolesOptions = {},
): DeployMultiReleaseEscrowPayload["roles"] {
  const addresses = included.map((member) => member.address);
  const alberto =
    included.find((member) => member.email === PAYROLL_ALBERTO_EMAIL)
      ?.address ?? addresses[0];

  if (!alberto) {
    throw new Error("Payroll run requires at least one team member.");
  }

  return {
    approvers: [alberto],
    serviceProviders: [alberto],
    platform: alberto,
    releaseSigners: [alberto],
    disputeResolvers: [disputeResolver],
    admin: options.adminAddress ?? alberto,
    observers: [],
  };
}

export function toPayrollDeployPayload(
  values: PayrollRunFormData,
  signer: string,
  disputeResolver?: string,
  network: NetworkType = getStoredNetwork(),
): DeployMultiReleaseEscrowPayload {
  const resolvedDisputeResolver =
    disputeResolver ?? resolvePayrollDisputeResolver(network);

  if (!resolvedDisputeResolver) {
    throw new Error(
      network === "mainnet"
        ? "Payroll dispute resolver is not configured (NEXT_PUBLIC_PAYROLL_DISPUTE_RESOLVER)."
        : "Payroll dispute resolver is missing for testnet.",
    );
  }

  const period: PayrollPeriod = {
    year: values.year,
    month: values.month as PayrollPeriod["month"],
    quincena: values.quincena as PayrollPeriod["quincena"],
  };

  const included = values.members.filter((member) => member.include);

  const milestones = included.flatMap((member) => [
    {
      description: buildMilestoneDescription(
        period,
        member.displayName,
        member.email,
      ),
      approvalsTarget: 1,
      amount: member.amount,
      receiver: member.address,
    },
    {
      description: buildTestMilestoneDescription(
        period,
        member.displayName,
        member.email,
      ),
      approvalsTarget: 1,
      amount: PAYROLL_TEST_MILESTONE_AMOUNT,
      receiver: member.address,
    },
  ]);

  return {
    signer,
    engagementId: buildPayrollEngagementId(period),
    title: buildPayrollTitle(period),
    description: buildPayrollDescription(period),
    platformFee: PAYROLL_PLATFORM_FEE,
    roles: buildPayrollRoles(included, resolvedDisputeResolver, {
      adminAddress: network === "testnet" ? TEMPLATE_ADMIN : undefined,
    }),
    milestones,
    trustline: {
      contractId: defaultTrustline?.value ?? "",
      symbol: defaultTrustline?.label ?? "USDC",
    },
  };
}

/** Salary total + 1 USDC test milestone per included member. */
export function getPayrollRunTotal(values: PayrollRunFormData): number {
  return values.members
    .filter((member) => member.include)
    .reduce(
      (sum, member) =>
        sum + (Number(member.amount) || 0) + PAYROLL_TEST_MILESTONE_AMOUNT,
      0,
    );
}

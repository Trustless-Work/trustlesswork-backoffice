import { PAYROLL_TEAM } from "@/features/payroll/constants/team.constants";
import type { EscrowMilestone } from "@/features/escrows/utils/escrow-milestone.helper";
import { isMilestoneReleased } from "@/features/escrows/utils/escrow-milestone.helper";

export type PayrollMilestoneKind = "salary" | "test";

export type PayrollMemberRow = {
  readonly index: number;
  readonly displayName: string;
  readonly email: string;
  readonly amount: number;
  readonly receiver: string;
  readonly paid: boolean;
  readonly kind: PayrollMilestoneKind;
};

function resolveMilestoneKind(
  description: string,
): PayrollMilestoneKind {
  if (/^test transaction/i.test(description.trim())) {
    return "test";
  }
  return "salary";
}

function resolveMemberMeta(milestone: EscrowMilestone): {
  displayName: string;
  email: string;
} {
  const receiver =
    "receiver" in milestone && typeof milestone.receiver === "string"
      ? milestone.receiver
      : "";

  const byAddress = PAYROLL_TEAM.find((member) => member.address === receiver);
  if (byAddress) {
    return {
      displayName: byAddress.displayName,
      email: byAddress.email,
    };
  }

  const description = milestone.description ?? "";
  const emailMatch = description.match(/\(([^)]+@[^)]+)\)/);
  const nameMatch = description.match(
    /(?:Salary|Test transaction) - .+ - (.+?) \(/,
  );

  return {
    displayName: nameMatch?.[1]?.trim() || `Member ${receiver.slice(0, 6)}`,
    email: emailMatch?.[1] ?? "",
  };
}

export function mapMilestonesToPayrollRows(
  milestones: readonly EscrowMilestone[],
): PayrollMemberRow[] {
  return milestones.map((milestone, index) => {
    const meta = resolveMemberMeta(milestone);
    const description = milestone.description ?? "";
    const amount =
      "amount" in milestone && typeof milestone.amount === "number"
        ? milestone.amount
        : 0;
    const receiver =
      "receiver" in milestone && typeof milestone.receiver === "string"
        ? milestone.receiver
        : "";

    return {
      index,
      displayName: meta.displayName,
      email: meta.email,
      amount,
      receiver,
      paid: isMilestoneReleased(milestone),
      kind: resolveMilestoneKind(description),
    };
  });
}

export function getPayrollPayLabel(row: PayrollMemberRow): string {
  if (row.kind === "test") {
    return `Pay test - ${row.displayName}`;
  }
  return `Pay ${row.displayName}`;
}

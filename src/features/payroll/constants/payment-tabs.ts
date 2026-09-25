import type { PayrollMilestoneKind } from "@/features/payroll/utils/payroll-members.helper";

export type PayrollPaymentTab = PayrollMilestoneKind;

export function isPayrollPaymentTab(
  value: string,
): value is PayrollPaymentTab {
  return value === "test" || value === "salary";
}

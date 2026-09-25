import { getPayrollTeamForNetwork } from "@/features/payroll/constants/team.constants";
import type { PayrollRunFormData } from "@/features/payroll/schemas/payroll-run.schema";
import { getCurrentPayrollPeriod } from "@/features/payroll/utils/payroll-naming.helper";
import { getStoredNetwork } from "@/lib/client-storage";
import type { NetworkType } from "@/types/network.entity";

type DefaultPayrollFormOptions = {
  readonly now?: Date;
  readonly network?: NetworkType;
  readonly signerAddress?: string | null;
};

export function getDefaultPayrollFormValues(
  options: DefaultPayrollFormOptions = {},
): PayrollRunFormData {
  const {
    now = new Date(),
    network = getStoredNetwork(),
    signerAddress = null,
  } = options;
  const period = getCurrentPayrollPeriod(now);
  const team = getPayrollTeamForNetwork(network, signerAddress);

  return {
    month: period.month,
    year: period.year,
    quincena: period.quincena,
    members: team.map((member) => ({
      email: member.email,
      displayName: member.displayName,
      address: member.address,
      amount: member.defaultAmount,
      include: true,
    })),
  };
}

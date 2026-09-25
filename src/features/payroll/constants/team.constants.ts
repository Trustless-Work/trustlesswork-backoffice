import type { NetworkType } from "@/types/network.entity";
import {
  TEMPLATE_ADMIN,
} from "@/features/escrows/utils/create-escrow-form.helper";

export type PayrollTeamMember = {
  readonly email: string;
  readonly displayName: string;
  /** Mainnet Stellar public key (testnet overrides via getPayrollTeamForNetwork). */
  readonly address: string;
  /** Salary amount in USDC (a separate 1 USDC test milestone is added at deploy). */
  readonly defaultAmount: number;
};

export const PAYROLL_ALBERTO_EMAIL = "alberto@trustlesswork.com";

/**
 * Trustless Work payroll roster (mainnet addresses).
 * Milestone receiver order: Alberto → Joel → Caleb → Armando.
 * On testnet, receivers are replaced with the connected wallet (escrow template pattern).
 */
export const PAYROLL_TEAM: readonly PayrollTeamMember[] = [
  {
    email: PAYROLL_ALBERTO_EMAIL,
    displayName: "Alberto",
    address: "GCRYH6M5YLTGZTCAALJPIJGQZY4Z6XFFUVTINCELQG4OGLADUBTAE3OU",
    defaultAmount: 1249,
  },
  {
    email: "joel@trustlesswork.com",
    displayName: "Joel",
    address: "GA2JZ2QTVBA5D4XARELS5L2LFVMNMR5NOLDKVSE4DNHSYD7X74U4QB2P",
    defaultAmount: 1249,
  },
  {
    email: "caleb@trustlesswork.com",
    displayName: "Caleb",
    address: "GDLFM5N7NHETROARF247NIIEHMDMQVY77WK7GEHJX36CF5AATPV3DEVV",
    defaultAmount: 1249,
  },
  {
    email: "armando@trustlesswork.com",
    displayName: "Armando",
    address: "GDF4ETNBEJDQ3JGCL7FJP2XU533PZDVHVNWVJ3K7M2KKZOJJYC2SXK7T",
    defaultAmount: 1249,
  },
] as const;

/**
 * Roster for the active network.
 * - mainnet → addresses from {@link PAYROLL_TEAM}
 * - testnet → same people, every receiver = connected wallet (create-escrow template)
 */
export function getPayrollTeamForNetwork(
  network: NetworkType,
  signerAddress: string | null | undefined,
): readonly PayrollTeamMember[] {
  if (network === "mainnet") {
    return PAYROLL_TEAM;
  }

  const address = signerAddress?.trim() || TEMPLATE_ADMIN;

  return PAYROLL_TEAM.map((member) => ({
    ...member,
    address,
  }));
}

import { z } from "zod/v3";
import { MAX_ROLE_ADDRESS_COUNT } from "@/features/escrows/constants/create-escrow.constants";
import { getAdminOverlapMessage } from "@/features/escrows/utils/create-escrow.helper";
import {
  isStellarContractId,
  STELLAR_PUBLIC_KEY_PATTERN,
} from "@/helpers/stellar.helper";

export const stellarAddressSchema = z
  .string()
  .trim()
  .regex(STELLAR_PUBLIC_KEY_PATTERN, "Invalid Stellar public key");

export const roleAddressArraySchema = z
  .array(stellarAddressSchema)
  .min(1, "Add at least one address")
  .max(
    MAX_ROLE_ADDRESS_COUNT,
    `Maximum ${MAX_ROLE_ADDRESS_COUNT} addresses allowed`,
  );

function compactAddressList(value: unknown): unknown {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return value;
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export const optionalRoleAddressArraySchema = z.preprocess(
  compactAddressList,
  z
    .array(stellarAddressSchema)
    .max(
      MAX_ROLE_ADDRESS_COUNT,
      `Maximum ${MAX_ROLE_ADDRESS_COUNT} addresses allowed`,
    ),
);

export const DISPUTE_RESOLVER_OVERLAP_MESSAGE =
  "A dispute resolver cannot also appear in approvers, service providers, release signers, or be the receiver / platform.";

type RolesWithOptionalReceiver = {
  approvers: string[];
  serviceProviders: string[];
  platform: string;
  releaseSigners: string[];
  disputeResolvers: string[];
  admin: string;
  receiver?: string;
};

function validateDisputeResolverOverlap(
  roles: RolesWithOptionalReceiver,
  ctx: z.RefinementCtx,
): void {
  const forbiddenAddresses = new Set<string>([
    ...roles.approvers,
    ...roles.serviceProviders,
    ...roles.releaseSigners,
    roles.platform,
  ]);

  if (roles.receiver) {
    forbiddenAddresses.add(roles.receiver);
  }

  roles.disputeResolvers.forEach((address, index) => {
    if (forbiddenAddresses.has(address)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: DISPUTE_RESOLVER_OVERLAP_MESSAGE,
        path: ["disputeResolvers", index],
      });
    }
  });
}

function validateAdminOverlap(
  roles: RolesWithOptionalReceiver,
  ctx: z.RefinementCtx,
): void {
  const { admin } = roles;

  if (!admin) {
    return;
  }

  const conflicts: ReadonlyArray<{ matches: boolean; roleLabel: string }> = [
    { matches: roles.approvers.includes(admin), roleLabel: "an approver" },
    {
      matches: roles.serviceProviders.includes(admin),
      roleLabel: "a service provider",
    },
    { matches: roles.platform === admin, roleLabel: "the platform" },
    {
      matches: roles.releaseSigners.includes(admin),
      roleLabel: "a release signer",
    },
    {
      matches: roles.disputeResolvers.includes(admin),
      roleLabel: "a dispute resolver",
    },
    { matches: roles.receiver === admin, roleLabel: "the receiver" },
  ];

  const conflict = conflicts.find((entry) => entry.matches);

  if (conflict) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: getAdminOverlapMessage(conflict.roleLabel),
      path: ["admin"],
    });
  }
}

export function withRolesOverlapValidation<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((roles, ctx) => {
    const typedRoles = roles as RolesWithOptionalReceiver;
    validateDisputeResolverOverlap(typedRoles, ctx);
    validateAdminOverlap(typedRoles, ctx);
  });
}

export const baseRolesSchema = z.object({
  approvers: roleAddressArraySchema,
  serviceProviders: roleAddressArraySchema,
  platform: stellarAddressSchema,
  releaseSigners: roleAddressArraySchema,
  disputeResolvers: roleAddressArraySchema,
  admin: stellarAddressSchema,
  observers: optionalRoleAddressArraySchema,
});

export const singleReleaseRolesSchema = withRolesOverlapValidation(
  baseRolesSchema.extend({
    receiver: stellarAddressSchema,
  }),
);

export const multiReleaseRolesSchema =
  withRolesOverlapValidation(baseRolesSchema);

export const trustlineAddressSchema = z
  .string()
  .trim()
  .refine(
    isStellarContractId,
    "Trustline must be a Soroban contract address (C…, 56 chars)",
  );

export const trustlineSchema = z.object({
  isCustom: z.boolean(),
  address: trustlineAddressSchema,
  symbol: z.string().trim().min(1, "Asset symbol is required"),
});

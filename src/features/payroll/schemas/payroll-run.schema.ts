import { z } from "zod/v3";
import { stellarAddressSchema } from "@/features/escrows/schemas/escrow-shared.schema";

export const payrollMemberSchema = z
  .object({
    email: z.string().email(),
    displayName: z.string().min(1),
    address: stellarAddressSchema,
    amount: z.coerce.number().min(0),
    include: z.boolean(),
  })
  .superRefine((member, ctx) => {
    if (member.include && member.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be greater than 0",
        path: ["amount"],
      });
    }
  });

export const payrollRunSchema = z
  .object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2100),
    quincena: z.coerce.number().int().min(1).max(2),
    members: z.array(payrollMemberSchema).min(1),
  })
  .superRefine((value, ctx) => {
    const included = value.members.filter((member) => member.include);

    if (included.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one team member",
        path: ["members"],
      });
    }
  });

export type PayrollMemberFormData = z.infer<typeof payrollMemberSchema>;
export type PayrollRunFormData = z.infer<typeof payrollRunSchema>;

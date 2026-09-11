"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  CREATE_ESCROW_ROLE_FIELDS,
  CREATE_ESCROW_PLACEHOLDERS,
  type MultiRoleFieldName,
} from "@/features/escrows/constants/create-escrow.constants";
import type { CreateEscrowFormData } from "@/features/escrows/schemas/create-escrow.schema";
import type { EscrowType } from "@/features/escrows/types/escrow.types";
import { EscrowRoleAddressList } from "@/features/escrows/ui/EscrowRoleAddressList";

type EscrowRolesFieldsProps = {
  form: UseFormReturn<CreateEscrowFormData>;
  escrowType: EscrowType;
  disabled?: boolean;
};

export const EscrowRolesFields = ({
  form,
  escrowType,
  disabled = false,
}: EscrowRolesFieldsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {CREATE_ESCROW_ROLE_FIELDS.map((role) => {
        if (role.singleReleaseOnly && escrowType !== "single-release") {
          return null;
        }

        if (role.multiple) {
          return (
            <EscrowRoleAddressList
              key={role.key}
              form={form}
              name={`roles.${role.key}` as MultiRoleFieldName}
              label={role.label}
              description={role.description}
              disabled={disabled}
              minCount={role.minCount ?? 1}
            />
          );
        }

        return (
          <div
            key={role.key}
            className="rounded-xl border border-border p-3 md:p-4"
          >
            <FormField
              control={form.control}
              name={`roles.${role.key}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{role.label}</FormLabel>
                  <FormDescription>{role.description}</FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={disabled}
                      placeholder={CREATE_ESCROW_PLACEHOLDERS.stellarAddress}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      })}
    </div>
  );
};

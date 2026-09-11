"use client";

import type { Path, UseFormReturn } from "react-hook-form";
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
  CREATE_ESCROW_PLACEHOLDERS,
  CREATE_ESCROW_ROLE_FIELDS,
} from "@/features/escrows/constants/create-escrow.constants";
import type { UpdateEscrowFormData } from "@/features/escrows/schemas/escrow-action.schemas";
import { EscrowRoleAddressList } from "@/features/escrows/ui/EscrowRoleAddressList";

type UpdateEscrowRolesFieldsProps = {
  form: UseFormReturn<UpdateEscrowFormData>;
  isMulti: boolean;
};

export const UpdateEscrowRolesFields = ({
  form,
  isMulti,
}: UpdateEscrowRolesFieldsProps) => {
  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm font-semibold tracking-tight">Roles</p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CREATE_ESCROW_ROLE_FIELDS.filter((role) => role.multiple).map(
          (role) => (
            <EscrowRoleAddressList
              key={role.key}
              form={form}
              name={`roles.${role.key}` as Path<UpdateEscrowFormData>}
              label={role.label}
              description={role.description}
              minCount={role.minCount ?? 1}
            />
          ),
        )}

        {!isMulti ? (
          <FormField
            control={form.control}
            name={"roles.receiver" as Path<UpdateEscrowFormData>}
            render={({ field }) => (
              <FormItem className="rounded-xl border border-border p-3 md:p-4">
                <FormLabel>Receiver</FormLabel>
                <FormDescription>
                  Single beneficiary for the full release.
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    value={typeof field.value === "string" ? field.value : ""}
                    placeholder={CREATE_ESCROW_PLACEHOLDERS.stellarAddress}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="roles.platform"
          render={({ field }) => (
            <FormItem className="rounded-xl border border-border p-3 md:p-4">
              <FormLabel>Platform</FormLabel>
              <FormDescription>Immutable after creation.</FormDescription>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roles.admin"
          render={({ field }) => (
            <FormItem className="rounded-xl border border-border p-3 md:p-4">
              <FormLabel>Admin</FormLabel>
              <FormDescription>Immutable after creation.</FormDescription>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
};

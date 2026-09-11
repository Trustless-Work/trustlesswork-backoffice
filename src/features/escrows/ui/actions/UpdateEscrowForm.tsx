"use client";

import type { Path, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CREATE_ESCROW_PLACEHOLDERS } from "@/features/escrows/constants/create-escrow.constants";
import type { CreateEscrowFormData } from "@/features/escrows/schemas/create-escrow.schema";
import type { UpdateEscrowFormData } from "@/features/escrows/schemas/escrow-action.schemas";
import { UpdateEscrowRolesFields } from "@/features/escrows/ui/actions/UpdateEscrowRolesFields";
import {
  EscrowTrustlineAddressField,
  EscrowTrustlineCustomSwitch,
  EscrowTrustlineField,
  EscrowTrustlineSymbolField,
} from "@/features/escrows/ui/EscrowTrustlineField";

type UpdateEscrowFormProps = {
  form: UseFormReturn<UpdateEscrowFormData>;
  isMulti: boolean;
};

export const UpdateEscrowForm = ({ form, isMulti }: UpdateEscrowFormProps) => {
  // Same trustline UI as Create — component is typed to CreateEscrowFormData;
  // trustline field shape is identical on UpdateEscrowFormData.
  const trustlineForm = form as unknown as UseFormReturn<CreateEscrowFormData>;

  return (
    <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto pr-1">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="engagementId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engagement ID</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={CREATE_ESCROW_PLACEHOLDERS.engagementId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={CREATE_ESCROW_PLACEHOLDERS.title}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder={CREATE_ESCROW_PLACEHOLDERS.description}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isMulti ? (
          <FormField
            control={form.control}
            name={"amount" as Path<UpdateEscrowFormData>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    placeholder={CREATE_ESCROW_PLACEHOLDERS.amount}
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? ""
                          : Number(event.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {!isMulti ? (
          <FormField
            control={form.control}
            name="platformFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform Fee (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    placeholder={CREATE_ESCROW_PLACEHOLDERS.platformFee}
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? ""
                          : Number(event.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
      </div>

      {isMulti ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Fees & asset</p>
            <EscrowTrustlineCustomSwitch form={trustlineForm} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="platformFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform Fee (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      placeholder={CREATE_ESCROW_PLACEHOLDERS.platformFee}
                      value={typeof field.value === "number" ? field.value : ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                        )
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <EscrowTrustlineAddressField form={trustlineForm} />
            <EscrowTrustlineSymbolField form={trustlineForm} />
          </div>
        </div>
      ) : (
        <EscrowTrustlineField form={trustlineForm} />
      )}

      <UpdateEscrowRolesFields form={form} isMulti={isMulti} />
    </div>
  );
};

"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
  MAX_ROLE_ADDRESS_COUNT,
} from "@/features/escrows/constants/create-escrow.constants";

function isAddressFilled(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

type EscrowRoleAddressListProps<TForm extends FieldValues> = {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
  label: string;
  description: string;
  disabled?: boolean;
  minCount?: number;
};

export const EscrowRoleAddressList = <TForm extends FieldValues>({
  form,
  name,
  label,
  description,
  disabled = false,
  minCount = 1,
}: EscrowRoleAddressListProps<TForm>) => {
  const watchedAddresses = useWatch({ control: form.control, name });
  const addresses: string[] = Array.isArray(watchedAddresses)
    ? (watchedAddresses as string[])
    : [];

  const setAddresses = (next: string[]): void => {
    form.setValue(name, next as PathValue<TForm, Path<TForm>>, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  };

  const appendAddress = (): void => {
    if (addresses.length >= MAX_ROLE_ADDRESS_COUNT) {
      return;
    }

    const lastAddress = addresses[addresses.length - 1];
    if (addresses.length > 0 && !isAddressFilled(lastAddress)) {
      return;
    }

    setAddresses([...addresses, ""]);
  };

  const removeAddress = (index: number): void => {
    if (addresses.length <= minCount) {
      return;
    }

    setAddresses(addresses.filter((_, currentIndex) => currentIndex !== index));
  };

  const lastAddress = addresses[addresses.length - 1];
  const canAppend =
    addresses.length < MAX_ROLE_ADDRESS_COUNT &&
    (addresses.length === 0 || isAddressFilled(lastAddress));

  return (
    <div className="rounded-xl border border-border p-3 md:p-4">
      <div className="mb-3 flex flex-col gap-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col gap-2">
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No addresses added yet.
          </p>
        ) : null}
        {addresses.map((_, index) => (
          <div key={`${name}-${index}`} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name={`${name}.${index}` as Path<TForm>}
              render={({ field: addressField }) => (
                <FormItem className="flex-1">
                  <FormLabel className="sr-only">
                    {label} {index + 1}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...addressField}
                      disabled={disabled}
                      placeholder={CREATE_ESCROW_PLACEHOLDERS.stellarAddress}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {addresses.length > minCount ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                className="mt-0.5 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeAddress(index)}
              >
                <Trash2Icon />
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      {addresses.length < MAX_ROLE_ADDRESS_COUNT ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !canAppend}
          className="mt-3"
          onClick={appendAddress}
        >
          <PlusIcon />
          Add address
        </Button>
      ) : (
        <FormDescription className="mt-3">
          Maximum of {MAX_ROLE_ADDRESS_COUNT} addresses reached.
        </FormDescription>
      )}
    </div>
  );
};

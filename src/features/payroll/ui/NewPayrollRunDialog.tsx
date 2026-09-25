"use client";

import { Loader2, PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { UsdcAmount } from "@/components/shared/UsdcAmount";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { usePayrollRunForm } from "@/features/payroll/hooks/usePayrollRunForm";
import type { PayrollRunFormData } from "@/features/payroll/schemas/payroll-run.schema";
import { PayrollPeriodPicker } from "@/features/payroll/ui/PayrollPeriodPicker";
import { getPayrollRunTotal } from "@/features/payroll/utils/payroll-payload.helper";

type NewPayrollRunDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MemberRows = () => {
  const form = useFormContext<PayrollRunFormData>();
  const members = useWatch({ control: form.control, name: "members" }) ?? [];

  return (
    <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
      {members.map((member, index) => (
        <div
          key={member.email}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-3"
        >
          <FormField
            control={form.control}
            name={`members.${index}.include`}
            render={({ field }) => (
              <FormItem className="flex flex-1 flex-row items-center gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                </FormControl>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-none">
                    {member.displayName}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`members.${index}.amount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Salary amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    className="h-8"
                    disabled={!member.include}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
};

const PayrollRunTotal = () => {
  const form = useFormContext<PayrollRunFormData>();
  const values = useWatch({ control: form.control });
  const total = useMemo(
    () => getPayrollRunTotal(values as PayrollRunFormData),
    [values],
  );

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
      <div>
        <p className="text-sm font-medium">Run total</p>
        <p className="text-xs text-muted-foreground">
          Includes +1 USDC test per member
        </p>
      </div>
      <UsdcAmount amount={total} symbol="USDC" size="lg" emphasis />
    </div>
  );
};

export const NewPayrollRunDialog = ({
  open,
  onOpenChange,
}: NewPayrollRunDialogProps) => {
  const { form, onSubmit, loading, walletAddress } = usePayrollRunForm({
    onSuccess: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle>New payroll run</DialogTitle>
          <DialogDescription>
            Deploys a multi-release escrow with salary and test milestones for
            the selected quincena.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto py-5">
              <PayrollPeriodPicker />

              <Separator />

              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    Team members
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Salary amount plus a separate 1 USDC test transaction each.
                  </p>
                </div>
                <MemberRows />
                {form.formState.errors.members?.root?.message ||
                form.formState.errors.members?.message ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.members.root?.message ??
                      form.formState.errors.members.message}
                  </p>
                ) : null}
              </div>

              <PayrollRunTotal />

              {!walletAddress ? (
                <p className="text-sm text-muted-foreground">
                  Connect your wallet in the navbar to create a run.
                </p>
              ) : null}
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !walletAddress}>
                {loading ? <Loader2 className="animate-spin" /> : <PlusIcon />}
                Create payroll run
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

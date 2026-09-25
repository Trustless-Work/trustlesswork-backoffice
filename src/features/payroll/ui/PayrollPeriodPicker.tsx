"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PayrollRunFormData } from "@/features/payroll/schemas/payroll-run.schema";
import {
  formatPayrollPeriodLabel,
  getPayrollPeriodFromCalendarDate,
  isPayrollCalendarDay,
  periodToCalendarDate,
  type PayrollPeriod,
} from "@/features/payroll/utils/payroll-naming.helper";
import { cn } from "@/lib/utils";

function toPayrollPeriod(
  month: number,
  year: number,
  quincena: number,
): PayrollPeriod | null {
  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(year) ||
    !Number.isInteger(quincena) ||
    (quincena !== 1 && quincena !== 2)
  ) {
    return null;
  }

  return {
    month: month as PayrollPeriod["month"],
    year,
    quincena,
  };
}

export const PayrollPeriodPicker = () => {
  const form = useFormContext<PayrollRunFormData>();
  const year = useWatch({ control: form.control, name: "year" });
  const quincena = useWatch({ control: form.control, name: "quincena" });

  return (
    <FormField
      control={form.control}
      name="month"
      render={({ field }) => {
        const period = toPayrollPeriod(field.value, year, quincena);
        const selected = period ? periodToCalendarDate(period) : undefined;
        const periodLabel = period ? formatPayrollPeriodLabel(period) : null;

        return (
          <FormItem className="flex flex-col gap-2">
            <FormLabel>Payroll period</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-start text-left font-normal",
                      !selected && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon />
                    {selected ? format(selected, "PPP") : "Pick a date"}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={selected}
                  defaultMonth={selected}
                  disabled={(date) => !isPayrollCalendarDay(date)}
                  onSelect={(date) => {
                    if (!date || !isPayrollCalendarDay(date)) {
                      return;
                    }
                    const next = getPayrollPeriodFromCalendarDate(date);
                    field.onChange(next.month);
                    form.setValue("year", next.year, { shouldValidate: true });
                    form.setValue("quincena", next.quincena, {
                      shouldValidate: true,
                    });
                  }}
                />
              </PopoverContent>
            </Popover>
            {periodLabel ? (
              <FormDescription>
                Only the 1st (1ra quincena) and 15th (2da quincena) are
                selectable. Selected:{" "}
                <span className="font-medium text-foreground">
                  {periodLabel}
                </span>
                .
              </FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

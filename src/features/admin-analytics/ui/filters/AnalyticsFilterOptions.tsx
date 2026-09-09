"use client";

import { CheckIcon } from "lucide-react";
import type { AnalyticsFilterOption } from "@/features/admin-analytics/types/analytics-filters.types";
import { cn } from "@/lib/utils";

type AnalyticsFilterOptionsProps<TValue extends string> = {
  options: readonly AnalyticsFilterOption<TValue>[];
  value: TValue;
  columns?: 1 | 2;
  className?: string;
  onChange: (value: TValue) => void;
};

export const AnalyticsFilterOptions = <TValue extends string>({
  options,
  value,
  columns = 1,
  className,
  onChange,
}: AnalyticsFilterOptionsProps<TValue>) => (
  <div
    className={cn(
      "grid gap-1.5",
      columns === 2 ? "grid-cols-2" : "grid-cols-1",
      className,
    )}
  >
    {options.map((option) => {
      const isActive = option.value === value;

      return (
        <button
          aria-pressed={isActive}
          className={cn(
            "flex h-8 cursor-pointer items-center gap-1.5 rounded-[min(var(--radius-md),10px)] border border-input px-2 text-left text-xs outline-none transition-colors",
            "text-muted-foreground hover:border-ring hover:text-foreground",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            isActive && "border-primary/60 font-medium text-foreground",
          )}
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
        >
          <CheckIcon
            aria-hidden="true"
            className={cn(
              "size-3.5 shrink-0 text-primary",
              !isActive && "opacity-0",
            )}
          />
          <span className="truncate">{option.label}</span>
        </button>
      );
    })}
  </div>
);

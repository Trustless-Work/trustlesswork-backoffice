"use client";

import type { ReactNode } from "react";
import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AnalyticsFilterPopoverProps = {
  activeCount: number;
  children: ReactNode;
  onClear: () => void;
};

export const AnalyticsFilterPopover = ({
  activeCount,
  children,
  onClear,
}: AnalyticsFilterPopoverProps) => (
  <Popover>
    <PopoverTrigger
      className={cn(
        "inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors sm:w-auto sm:justify-start",
        "hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "dark:bg-input/30 dark:hover:bg-input/50",
      )}
    >
      <SlidersHorizontalIcon
        aria-hidden="true"
        className="size-4 text-muted-foreground"
      />
      Filters
      {activeCount > 0 ? (
        <span className="inline-flex size-4 items-center justify-center rounded-full border border-primary/40 font-medium text-[0.625rem] text-primary tabular-nums">
          {activeCount}
        </span>
      ) : null}
    </PopoverTrigger>

    <PopoverContent
      align="end"
      className="w-[min(18rem,calc(100vw-2rem))] gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <PopoverTitle>Filters</PopoverTitle>
        <Button
          disabled={activeCount === 0}
          size="xs"
          type="button"
          variant="ghost"
          onClick={onClear}
        >
          <RotateCcwIcon className="size-3" />
          Clear
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">{children}</div>
    </PopoverContent>
  </Popover>
);

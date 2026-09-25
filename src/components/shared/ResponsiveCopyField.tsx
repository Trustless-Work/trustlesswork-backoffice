"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ResponsiveCopyFieldProps = {
  label?: string;
  value: string;
  compact?: boolean;
  className?: string;
  maxVisibleChars?: number;
  highlighted?: boolean;
  linkable?: boolean;
  onLinkHoverStart?: () => void;
  onLinkHoverEnd?: () => void;
};

const ELLIPSIS = "...";
const MIN_VISIBLE_CHARS = 10;
const FULL_VALUE_BUFFER = 4;
const AVERAGE_CHARACTER_WIDTH = 8;
const COPY_BUTTON_WIDTH = 74;
const COMPACT_COPY_BUTTON_WIDTH = 38;
const HORIZONTAL_PADDING = 32;

function getResponsiveValue(
  value: string,
  width: number,
  compact: boolean,
  maxVisibleChars?: number,
): string {
  const truncateTo = (visibleChars: number): string => {
    if (value.length <= visibleChars) {
      return value;
    }

    const headChars = Math.ceil(visibleChars * 0.56);
    const tailChars = Math.max(4, visibleChars - headChars);

    return `${value.slice(0, headChars)}${ELLIPSIS}${value.slice(-tailChars)}`;
  };

  // Avoid flashing the full address before ResizeObserver measures width.
  if (width <= 0) {
    if (maxVisibleChars !== undefined) {
      return truncateTo(Math.max(maxVisibleChars, MIN_VISIBLE_CHARS));
    }
    return value;
  }

  const reservedWidth =
    (compact ? COMPACT_COPY_BUTTON_WIDTH : COPY_BUTTON_WIDTH) +
    HORIZONTAL_PADDING;
  const availableWidth = Math.max(width - reservedWidth, 0);
  const availableChars = Math.floor(
    availableWidth / AVERAGE_CHARACTER_WIDTH,
  );

  const cappedAvailableChars =
    maxVisibleChars === undefined
      ? availableChars
      : Math.min(availableChars, maxVisibleChars);

  if (
    maxVisibleChars === undefined &&
    availableChars >= value.length + FULL_VALUE_BUFFER
  ) {
    return value;
  }

  const visibleChars = Math.max(cappedAvailableChars, MIN_VISIBLE_CHARS);
  if (maxVisibleChars === undefined && visibleChars >= value.length) {
    return value;
  }

  return truncateTo(visibleChars);
}

export const ResponsiveCopyField = ({
  label,
  value,
  compact = false,
  className,
  maxVisibleChars,
  highlighted = false,
  linkable = false,
  onLinkHoverStart,
  onLinkHoverEnd,
}: ResponsiveCopyFieldProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const visibleValue = useMemo(
    () => getResponsiveValue(value, containerWidth, compact, maxVisibleChars),
    [compact, containerWidth, maxVisibleChars, value],
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex w-full min-w-0 flex-col gap-2",
        compact && "gap-1.5",
        className,
      )}
    >
      {label ? (
        <span className="text-sm text-muted-foreground">{label}</span>
      ) : null}

      <div
        className={cn(
          "flex w-full min-w-0 items-center gap-2 border bg-muted/40 transition-colors duration-200",
          "rounded-xl px-3 py-2 sm:rounded-full sm:px-4",
          !compact && "sm:py-3",
          highlighted
            ? "border-dashed border-primary/80 bg-primary/10 ring-1 ring-primary/25"
            : "border-border",
          linkable && "cursor-pointer",
        )}
        onMouseEnter={linkable ? onLinkHoverStart : undefined}
        onMouseLeave={linkable ? onLinkHoverEnd : undefined}
      >
        <code
          className="min-w-0 flex-1 truncate font-mono text-xs sm:text-sm"
          title={value}
        >
          {visibleValue}
        </code>

        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            compact
              ? "size-7 sm:size-auto sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:hover:bg-transparent"
              : "size-8 sm:size-auto sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:hover:bg-transparent",
          )}
          aria-label={label ? `Copy ${label}` : "Copy value"}
          onClick={() => {
            void handleCopy();
          }}
        >
          {copied ? (
            <>
              <CheckIcon className="size-4 shrink-0" aria-hidden="true" />
              <span className={cn(compact && "sr-only")}>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="size-4 shrink-0" aria-hidden="true" />
              <span className={cn(compact && "sr-only")}>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: string;
  icon: ReactNode;
};

export type TabLinkItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

type RoundedTabsProps = {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
};

type RoundedTabLinksProps = {
  items: TabLinkItem[];
  className?: string;
  fullWidth?: boolean;
};

function useSlidingIndicator(activeValue: string, itemsLength: number) {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
  });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      const el = list.querySelector<HTMLElement>(
        `[data-value="${CSS.escape(activeValue)}"]`,
      );
      if (!el) return;
      const width = el.offsetWidth;
      setIndicator({
        left: el.offsetLeft,
        width,
        ready: width > 0,
      });
    };

    update();

    const observer = new ResizeObserver(() => {
      update();
    });
    observer.observe(list);
    list
      .querySelectorAll<HTMLElement>("[data-value]")
      .forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [activeValue, itemsLength]);

  return { listRef, indicator };
}

export function RoundedTabs({
  items,
  defaultValue,
  value,
  onValueChange,
  className,
  fullWidth = false,
}: RoundedTabsProps) {
  const groupId = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;
  const { listRef, indicator } = useSlidingIndicator(active, items.length);

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Tabs"
      className={cn(
        "relative flex items-center gap-1 rounded-full border border-border bg-muted/60 p-1",
        fullWidth ? "w-full lg:w-auto" : "w-fit",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1 bottom-1 rounded-full bg-card shadow-sm ring-1 ring-border",
          indicator.ready
            ? "transition-all duration-300 ease-out"
            : "opacity-0",
        )}
        style={{ left: indicator.left, width: indicator.width }}
      />

      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <button
            key={item.value}
            data-value={item.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            id={`${groupId}-${item.value}-tab`}
            onClick={() => select(item.value)}
            className={cn(
              "cursor-pointer relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
              "outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring",
              fullWidth && "flex-1 justify-center lg:flex-none",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="[&_svg]:size-4 [&_svg]:shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function RoundedTabLinks({
  items,
  className,
  fullWidth = false,
}: RoundedTabLinksProps) {
  const groupId = useId();
  const pathname = usePathname();
  const active =
    items.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.href ?? items[0]?.href;
  const { listRef, indicator } = useSlidingIndicator(active, items.length);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Tabs"
      className={cn(
        "relative flex items-center gap-1 rounded-full border border-border bg-muted/60 p-1",
        fullWidth ? "w-full lg:w-auto" : "w-fit",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1 bottom-1 rounded-full bg-card shadow-sm ring-1 ring-border",
          indicator.ready
            ? "transition-all duration-300 ease-out"
            : "opacity-0",
        )}
        style={{ left: indicator.left, width: indicator.width }}
      />

      {items.map((item) => {
        const isActive = item.href === active;
        return (
          <Link
            key={item.href}
            href={item.href}
            data-value={item.href}
            role="tab"
            aria-selected={isActive}
            id={`${groupId}-${item.href}-tab`}
            className={cn(
              "relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
              "outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring",
              fullWidth && "flex-1 justify-center lg:flex-none",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="[&_svg]:size-4 [&_svg]:shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { getDashboardPage } from "@/constants/pages";
import { cn } from "@/lib/utils";
import { useDashboardPageHeaderSlot } from "@/components/shared/DashboardPageHeaderContext";

type DashboardPageHeaderProps = {
  actions?: ReactNode;
  className?: string;
};

export const DashboardPageHeader = ({
  actions: actionsProp,
  className,
}: DashboardPageHeaderProps) => {
  const pathname = usePathname();
  const page = getDashboardPage(pathname);
  const actionsFromContext = useDashboardPageHeaderSlot();
  const actions = actionsProp ?? actionsFromContext;

  if (!page) {
    return null;
  }

  const Icon = page.icon;

  return (
    <header className={cn("flex flex-col gap-4 pb-2", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted/10 sm:size-14">
            <Icon className="size-5 text-foreground sm:size-6" aria-hidden />
          </div>

          <div className="min-w-0 space-y-1">
            <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
              {page.title}
            </h1>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              {page.description}
            </p>
          </div>
        </div>

        {actions ? (
          <div className="flex w-full shrink-0 items-center justify-stretch lg:w-auto lg:max-w-xl lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>

      <Separator />
    </header>
  );
};

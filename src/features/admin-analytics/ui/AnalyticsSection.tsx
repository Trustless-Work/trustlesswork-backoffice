"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AnalyticsSectionProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export const AnalyticsSection = ({
  icon: Icon,
  title,
  description,
  children,
  className,
}: AnalyticsSectionProps) => (
  <section className={cn("flex flex-col gap-4", className)}>
    <header className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border sm:size-10">
          <Icon
            aria-hidden="true"
            className="size-4 text-foreground sm:size-[1.125rem]"
          />
        </div>
        <div className="min-w-0 space-y-0.5 pt-0.5">
          <h2 className="text-pretty text-base font-semibold tracking-tight sm:text-lg">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <Separator />
    </header>
    {children}
  </section>
);

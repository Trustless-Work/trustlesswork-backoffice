import type { ReactNode } from "react";

type AnalyticsFilterFieldProps = {
  label: string;
  children: ReactNode;
};

export const AnalyticsFilterField = ({
  label,
  children,
}: AnalyticsFilterFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <span className="font-medium text-[0.7rem] text-muted-foreground uppercase tracking-wide">
      {label}
    </span>
    {children}
  </div>
);

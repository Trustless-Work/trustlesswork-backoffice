import type { LucideIcon } from "lucide-react";
import { CoinsIcon, DiscIcon, KeyIcon, TrendingUpIcon } from "lucide-react";

export type AnalyticsTabId = "growth" | "revenue" | "escrows" | "api-keys";

export type AnalyticsTab = {
  id: AnalyticsTabId;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const ANALYTICS_TABS: readonly AnalyticsTab[] = [
  {
    id: "growth",
    label: "Growth",
    icon: TrendingUpIcon,
    description: "Escrow and user sign-up trends",
  },
  {
    id: "revenue",
    label: "Revenue",
    icon: CoinsIcon,
    description: "Platform take by token",
  },
  {
    id: "escrows",
    label: "Escrows",
    icon: DiscIcon,
    description: "Live escrow status funnel",
  },
  {
    id: "api-keys",
    label: "API Keys",
    icon: KeyIcon,
    description: "Key usage and platform attribution",
  },
] as const;

export const DEFAULT_ANALYTICS_TAB: AnalyticsTabId = "growth";

export function isAnalyticsTabId(value: string | null): value is AnalyticsTabId {
  return ANALYTICS_TABS.some((tab) => tab.id === value);
}

export const ANALYTICS_MONTH_OPTIONS = [3, 6, 12, 24, 36] as const;

export const DEFAULT_ANALYTICS_MONTHS = 12;

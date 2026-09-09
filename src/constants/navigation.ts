import type { LucideIcon } from "lucide-react";
import {
  DiscIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  WebhookIcon,
} from "lucide-react";
import {
  ANALYTICS_TABS,
  DEFAULT_ANALYTICS_TAB,
} from "@/features/admin-analytics/constants/analytics-tabs";
import type { NavSearchFallback } from "@/helpers/nav-active.helper";

export type DashboardNavSubItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  external?: boolean;
};

export type DashboardNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  external?: boolean;
  items?: DashboardNavSubItem[];
  searchFallback?: NavSearchFallback;
};

export type DashboardNavGroup = {
  label: string;
  showLabel?: boolean;
  items: DashboardNavItem[];
};

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: "Platform",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Manage Escrows",
        url: "/dashboard/escrows",
        icon: DiscIcon,
      },
    ],
  },
  {
    label: "Integrations",
    items: [
      {
        title: "API Keys",
        url: "/dashboard/api-keys",
        icon: KeyRoundIcon,
      },
      {
        title: "Webhooks",
        url: "/dashboard/webhooks",
        icon: WebhookIcon,
      },
    ],
  },
];

/** Backoffice sidebar — same shape as the dashboard, different destinations. */
export const ADMIN_NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: "Platform",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboardIcon,
        searchFallback: { tab: DEFAULT_ANALYTICS_TAB },
        items: ANALYTICS_TABS.map((tab) => ({
          title: tab.label,
          url: `/admin?tab=${tab.id}`,
          icon: tab.icon,
        })),
      },
    ],
  },
];

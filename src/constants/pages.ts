import type { LucideIcon } from "lucide-react";
import {
  CircleHelpIcon,
  DiscIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  WebhookIcon,
} from "lucide-react";

export type DashboardPageConfig = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const DASHBOARD_PAGES: Record<string, DashboardPageConfig> = {
  "/dashboard": {
    title: "Dashboard",
    description:
      "Get a snapshot of your escrows, recent activity, and integration health.",
    icon: LayoutDashboardIcon,
  },
  "/dashboard/escrows": {
    title: "Manage Escrows",
    description:
      "Browse, filter, and manage escrow contracts on the Stellar network.",
    icon: DiscIcon,
  },
  "/dashboard/api-keys": {
    title: "API Keys",
    description:
      "Generate and rotate API keys to authenticate your applications.",
    icon: KeyRoundIcon,
  },
  "/dashboard/webhooks": {
    title: "Webhooks",
    description:
      "Subscribe to escrow events and deliver payloads to your endpoints.",
    icon: WebhookIcon,
  },
  "/dashboard/settings": {
    title: "Settings",
    description:
      "Update your profile, preferences, and workspace configuration.",
    icon: Settings2Icon,
  },
  "/dashboard/help": {
    title: "Help",
    description:
      "Learn how escrow roles work and which actions each wallet can perform.",
    icon: CircleHelpIcon,
  },
};

export const ADMIN_PAGES: Record<string, DashboardPageConfig> = {
  "/admin": {
    title: "Analytics",
    description:
      "Platform growth, revenue by token, and escrow lifecycle insights.",
    icon: LayoutDashboardIcon,
  },
};

const SECTION_ROOTS = new Set(["/dashboard", "/admin"]);

function matchPageConfig(
  pathname: string,
  pages: Record<string, DashboardPageConfig>,
): DashboardPageConfig | null {
  const exactMatch = pages[pathname];
  if (exactMatch) {
    return exactMatch;
  }

  const nestedMatch = Object.entries(pages)
    .filter(
      ([path]) => !SECTION_ROOTS.has(path) && pathname.startsWith(`${path}/`),
    )
    .sort(([pathA], [pathB]) => pathB.length - pathA.length)[0];

  return nestedMatch?.[1] ?? null;
}

export function getDashboardPage(pathname: string): DashboardPageConfig | null {
  return (
    matchPageConfig(pathname, DASHBOARD_PAGES) ??
    matchPageConfig(pathname, ADMIN_PAGES)
  );
}

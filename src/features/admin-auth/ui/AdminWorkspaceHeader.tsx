"use client";

import Image from "next/image";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

/**
 * Sidebar header stand-in for the dashboard OrganizationSwitcher.
 * Same footprint (size="lg" button + avatar tile); not interactive yet.
 */
export const AdminWorkspaceHeader = () => {
  return (
    <SidebarMenu className="mt-2">
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="pointer-events-none">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg group-data-[collapsible=icon]:size-8">
            <Image
              src="/icon.png"
              alt="Trustless Work"
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">Trustless Work</span>
            <span className="truncate text-xs text-muted-foreground">
              Analytics
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

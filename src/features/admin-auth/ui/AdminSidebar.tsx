"use client";

import type { ComponentProps } from "react";
import { NavMain } from "@/components/ui/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ADMIN_NAV_GROUPS } from "@/constants/navigation";
import { AdminNavUser } from "@/features/admin-auth/ui/AdminNavUser";
import { AdminWorkspaceHeader } from "@/features/admin-auth/ui/AdminWorkspaceHeader";

type AdminSidebarProps = ComponentProps<typeof Sidebar> & {
  email: string;
};

/**
 * Same shell as `AppSidebar`: header, nav groups, footer user.
 * Only the destinations and the header/footer wiring differ.
 */
export const AdminSidebar = ({ email, ...props }: AdminSidebarProps) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AdminWorkspaceHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={ADMIN_NAV_GROUPS} />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser email={email} />
      </SidebarFooter>
    </Sidebar>
  );
};

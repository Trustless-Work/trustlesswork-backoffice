"use client";

import { Lights } from "@/components/shared/Lights";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { DashboardPageHeaderProvider } from "@/components/shared/DashboardPageHeaderContext";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminNavbar } from "@/features/admin-auth/ui/AdminNavbar";
import { AdminSidebar } from "@/features/admin-auth/ui/AdminSidebar";

type AdminShellProps = {
  email: string;
  children: React.ReactNode;
};

/**
 * Protected /admin chrome — structural twin of the dashboard layout.
 *
 * Same `SidebarProvider` / `Lights` / `SidebarInset` / page-header stack.
 * Includes network switching (mainnet locked until enabled globally).
 */
export const AdminShell = ({ email, children }: AdminShellProps) => {
  return (
    <SidebarProvider defaultOpen={false} className="block min-h-svh md:flex">
      <Lights />
      <AdminSidebar email={email} />
      <SidebarInset className="min-h-svh">
        <AdminNavbar />

        <DashboardPageHeaderProvider>
          <div className="flex min-h-[calc(100svh-7rem)] flex-1 flex-col gap-2 p-4 md:min-h-[calc(100svh-4rem)] md:px-8">
            <DashboardPageHeader />
            {children}
          </div>
        </DashboardPageHeaderProvider>
      </SidebarInset>
    </SidebarProvider>
  );
};

import { AppSidebar } from "@/components/ui/app-sidebar";
import { Lights } from "@/components/shared/Lights";
import { Navbar } from "@/components/shared/Navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { DashboardPageHeaderProvider } from "@/components/shared/DashboardPageHeaderContext";
import { OnboardingWalkthroughProvider } from "@/features/onboarding/ui/OnboardingWalkthroughProvider";
import { OrganizationProvider } from "@/providers/OrganizationProvider";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <OrganizationProvider>
      <OnboardingWalkthroughProvider>
        <SidebarProvider defaultOpen={false} className="block min-h-svh md:flex">
          <Lights />
          <AppSidebar />
          <SidebarInset className="min-h-svh">
            <Navbar />

            <DashboardPageHeaderProvider>
              <div className="flex min-h-[calc(100svh-7rem)] flex-1 flex-col gap-2 p-4 md:min-h-[calc(100svh-4rem)] md:px-8">
                <DashboardPageHeader />
                {children}
              </div>
            </DashboardPageHeaderProvider>
          </SidebarInset>
        </SidebarProvider>
      </OnboardingWalkthroughProvider>
    </OrganizationProvider>
  );
}

"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { NetworkToggle } from "@/components/shared/NetworkToggle";
import { ToggleTheme } from "@/components/shared/ToggleTheme";

export const AdminNavbar = () => {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 md:h-16 md:gap-2 md:px-8">
        <SidebarTrigger className="-ml-1 size-9 shrink-0 md:hidden" />
        <Separator
          orientation="vertical"
          className="mr-1 shrink-0 data-vertical:h-4 data-vertical:self-auto md:hidden"
        />

        <div className="min-w-0 flex-1 overflow-hidden">
          <Breadcrumb />
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <NetworkToggle />
          <ToggleTheme />
        </div>

        <div className="flex shrink-0 items-center md:hidden">
          <ToggleTheme />
        </div>
      </div>

      <div className="border-t border-border/60 px-3 py-2 md:hidden">
        <NetworkToggle className="w-full justify-center px-2" />
      </div>
    </header>
  );
};

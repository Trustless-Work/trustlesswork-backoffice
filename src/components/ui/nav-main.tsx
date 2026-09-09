"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type {
  DashboardNavGroup,
  DashboardNavItem,
  DashboardNavSubItem,
} from "@/constants/navigation";
import {
  isNavPathnameActive,
  isNavUrlActive,
  splitNavUrl,
  type NavSearchFallback,
} from "@/helpers/nav-active.helper";
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react";

function isCollapsibleActive(
  pathname: string,
  search: string,
  item: DashboardNavItem,
): boolean {
  const itemPathname = splitNavUrl(item.url).pathname;

  if (isNavPathnameActive(pathname, itemPathname)) {
    return true;
  }

  return (
    item.items?.some(
      (subItem) =>
        !subItem.external &&
        isNavUrlActive(pathname, search, subItem.url, item.searchFallback),
    ) ?? false
  );
}

function NavSubMenuItem({
  item,
  pathname,
  search,
  searchFallback,
}: {
  item: DashboardNavSubItem;
  pathname: string;
  search: string;
  searchFallback?: NavSearchFallback;
}) {
  const Icon = item.icon;

  if (item.external) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild size="sm">
          <Link href={item.url} target="_blank" rel="noopener noreferrer">
            <Icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  const isActive = isNavUrlActive(
    pathname,
    search,
    item.url,
    searchFallback,
  );

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive} size="sm">
        <Link href={item.url} scroll={false}>
          <Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

function NavCollapsibleItem({
  item,
  pathname,
  search,
}: {
  item: DashboardNavItem;
  pathname: string;
  search: string;
}) {
  const Icon = item.icon;
  const isActive = isCollapsibleActive(pathname, search, item);

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isActive}>
            <Icon />
            <span>{item.title}</span>
            <ChevronRightIcon className="ml-auto transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[collapsible=icon]:hidden group-data-open/collapsible:rotate-90 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <NavSubMenuItem
                key={subItem.title}
                item={subItem}
                pathname={pathname}
                search={search}
                searchFallback={item.searchFallback}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function NavLinkItem({
  item,
  pathname,
}: {
  item: DashboardNavItem;
  pathname: string;
}) {
  const Icon = item.icon;
  const isActive = isNavPathnameActive(pathname, item.url);

  if (item.external) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.title}>
          <Link href={item.url} target="_blank" rel="noopener noreferrer">
            <Icon />
            <span>{item.title}</span>
            <ArrowUpRightIcon className="ml-auto size-3.5 text-muted-foreground" />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link href={item.url}>
          <Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavGroup({
  group,
  pathname,
  search,
}: {
  group: DashboardNavGroup;
  pathname: string;
  search: string;
}) {
  const showLabel = group.showLabel ?? true;

  return (
    <SidebarGroup>
      {showLabel ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {group.items.map((item) =>
          item.items?.length ? (
            <NavCollapsibleItem
              key={item.title}
              item={item}
              pathname={pathname}
              search={search}
            />
          ) : (
            <NavLinkItem key={item.title} item={item} pathname={pathname} />
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavGroups({
  groups,
  search,
}: {
  groups: DashboardNavGroup[];
  search: string;
}) {
  const pathname = usePathname();

  return (
    <>
      {groups.map((group) => (
        <NavGroup
          key={group.label}
          group={group}
          pathname={pathname}
          search={search}
        />
      ))}
    </>
  );
}

function NavMainWithSearch({ groups }: { groups: DashboardNavGroup[] }) {
  const searchParams = useSearchParams();

  return <NavGroups groups={groups} search={searchParams.toString()} />;
}

export function NavMain({ groups }: { groups: DashboardNavGroup[] }) {
  return (
    <Suspense fallback={<NavGroups groups={groups} search="" />}>
      <NavMainWithSearch groups={groups} />
    </Suspense>
  );
}

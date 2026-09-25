"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb as BreadcrumbUI,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { truncateStellarAddress } from "@/helpers/stellar.helper";

type BreadcrumbItemData = {
  href: string;
  label: string;
  title?: string;
};

function formatBreadcrumbLabel(
  segment: string,
  parentSegment?: string,
): string {
  const decoded = decodeURIComponent(segment);

  if (
    (parentSegment === "escrows" || parentSegment === "payroll") &&
    decoded.length > 6
  ) {
    return truncateStellarAddress(decoded, 3, 3);
  }

  return decoded
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getBreadcrumbItems(pathname: string): BreadcrumbItemData[] {
  if (pathname === "/") {
    return [{ href: "/", label: "Home" }];
  }

  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join("/")}`,
    label: formatBreadcrumbLabel(segment, segments[index - 1]),
    title:
      (segments[index - 1] === "escrows" ||
        segments[index - 1] === "payroll") &&
      segment.length > 6
        ? decodeURIComponent(segment)
        : undefined,
  }));
}

export const Breadcrumb = () => {
  const pathname = usePathname();
  const items = getBreadcrumbItems(pathname);

  return (
    <BreadcrumbUI>
      <BreadcrumbList className="flex-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={item.href}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem
                className={cn("min-w-0", !isLast && "hidden md:block")}
              >
                {isLast ? (
                  <BreadcrumbPage className="truncate" title={item.title}>
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="truncate">
                    <Link href={item.href} title={item.title}>
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbUI>
  );
};

import { describe, expect, it } from "vitest";
import {
  isNavPathnameActive,
  isNavUrlActive,
  isSectionHomePath,
  splitNavUrl,
} from "@/helpers/nav-active.helper";

describe("splitNavUrl", () => {
  it("splits a path from its query string", () => {
    const result = splitNavUrl("/admin?tab=revenue");
    expect(result.pathname).toBe("/admin");
    expect(result.searchParams.get("tab")).toBe("revenue");
  });

  it("returns empty search params when the url has no query", () => {
    const result = splitNavUrl("/dashboard");
    expect(result.pathname).toBe("/dashboard");
    expect([...result.searchParams.entries()]).toEqual([]);
  });
});

describe("isSectionHomePath", () => {
  it("treats a single segment as a section home", () => {
    expect(isSectionHomePath("/admin")).toBe(true);
    expect(isSectionHomePath("/dashboard")).toBe(true);
  });

  it("treats nested routes as section children", () => {
    expect(isSectionHomePath("/dashboard/escrows")).toBe(false);
  });
});

describe("isNavPathnameActive", () => {
  it("matches section homes only exactly", () => {
    expect(isNavPathnameActive("/admin", "/admin")).toBe(true);
    expect(isNavPathnameActive("/admin/users", "/admin")).toBe(false);
  });

  it("matches nested routes as prefixes", () => {
    expect(
      isNavPathnameActive("/dashboard/escrows/abc", "/dashboard/escrows"),
    ).toBe(true);
    expect(isNavPathnameActive("/dashboard/api-keys", "/dashboard/escrows")).toBe(
      false,
    );
  });
});

describe("isNavUrlActive", () => {
  it("ignores the current search when the target has no query", () => {
    expect(isNavUrlActive("/admin", "tab=revenue", "/admin")).toBe(true);
  });

  it("matches the current search params on the target url", () => {
    expect(
      isNavUrlActive("/admin", "tab=revenue", "/admin?tab=revenue"),
    ).toBe(true);
    expect(
      isNavUrlActive("/admin", "tab=revenue", "/admin?tab=growth"),
    ).toBe(false);
  });

  it("uses search fallback when the current param is missing", () => {
    expect(
      isNavUrlActive("/admin", "", "/admin?tab=growth", { tab: "growth" }),
    ).toBe(true);
    expect(
      isNavUrlActive("/admin", "", "/admin?tab=revenue", { tab: "growth" }),
    ).toBe(false);
  });

  it("does not match a different pathname", () => {
    expect(
      isNavUrlActive("/dashboard", "tab=growth", "/admin?tab=growth"),
    ).toBe(false);
  });
});

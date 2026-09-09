import { describe, expect, it, vi } from "vitest";
import {
  AdminUsersService,
  hasAdminRole,
  parseAdminUserRow,
  type AdminUserRowResult,
} from "@/features/admin-auth/services/admin-users.service";

const service = new AdminUsersService();

function fetcherReturning(result: AdminUserRowResult) {
  return vi.fn((): Promise<AdminUserRowResult> => Promise.resolve(result));
}

const adminRow = {
  id: 42,
  email: "ada@trustlesswork.com",
  roles: ["ADMIN", "ESCROW_MANAGER"],
  created_at: "2026-01-01T00:00:00Z",
};

describe("AdminUsersService.findAdminByEmail", () => {
  it("returns the mapped row for an admin", async () => {
    const fetchRow = fetcherReturning({ data: adminRow, error: null });

    await expect(
      service.findAdminByEmail(fetchRow, "ada@trustlesswork.com"),
    ).resolves.toEqual({
      id: "42",
      email: "ada@trustlesswork.com",
      roles: ["ADMIN", "ESCROW_MANAGER"],
      createdAt: "2026-01-01T00:00:00Z",
    });
  });

  it("normalizes the email before querying", async () => {
    const fetchRow = fetcherReturning({ data: adminRow, error: null });

    await service.findAdminByEmail(fetchRow, "  Ada@TrustlessWork.com  ");

    expect(fetchRow).toHaveBeenCalledExactlyOnceWith("ada@trustlesswork.com");
  });

  it("accepts a row whose stored casing differs", async () => {
    const fetchRow = fetcherReturning({
      data: { ...adminRow, email: "Ada@TrustlessWork.com" },
      error: null,
    });

    await expect(
      service.findAdminByEmail(fetchRow, "ada@trustlesswork.com"),
    ).resolves.not.toBeNull();
  });

  it("rejects a row matched only through an ilike wildcard", async () => {
    // `a_b@` is a LIKE pattern that also matches `axb@`.
    const fetchRow = fetcherReturning({
      data: { ...adminRow, email: "axb@trustlesswork.com" },
      error: null,
    });

    await expect(
      service.findAdminByEmail(fetchRow, "a_b@trustlesswork.com"),
    ).resolves.toBeNull();
  });

  it("returns null when the row lacks the ADMIN role", async () => {
    const fetchRow = fetcherReturning({
      data: { ...adminRow, roles: ["ESCROW_MANAGER", "BACKOFFICE_ADMIN"] },
      error: null,
    });

    await expect(
      service.findAdminByEmail(fetchRow, "ada@trustlesswork.com"),
    ).resolves.toBeNull();
  });

  it("returns null when the read fails", async () => {
    const fetchRow = fetcherReturning({
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(
      service.findAdminByEmail(fetchRow, "ada@trustlesswork.com"),
    ).resolves.toBeNull();
  });

  it("returns null when no row exists", async () => {
    const fetchRow = fetcherReturning({ data: null, error: null });

    await expect(
      service.findAdminByEmail(fetchRow, "ada@trustlesswork.com"),
    ).resolves.toBeNull();
  });

  it("returns null for a malformed row instead of trusting it", async () => {
    const fetchRow = fetcherReturning({ data: { id: 42 }, error: null });

    await expect(
      service.findAdminByEmail(fetchRow, "ada@trustlesswork.com"),
    ).resolves.toBeNull();
  });

  it("does not query on a blank email", async () => {
    const fetchRow = fetcherReturning({ data: adminRow, error: null });

    await expect(service.findAdminByEmail(fetchRow, "   ")).resolves.toBeNull();
    expect(fetchRow).not.toHaveBeenCalled();
  });
});

describe("parseAdminUserRow", () => {
  it("stringifies the bigint id", () => {
    expect(
      parseAdminUserRow({ id: 42, email: "ada@trustlesswork.com" }),
    ).toEqual({
      id: "42",
      email: "ada@trustlesswork.com",
      roles: [],
      createdAt: null,
    });
  });

  it("defaults optional columns to null or empty", () => {
    expect(
      parseAdminUserRow({ id: "42", email: "ada@trustlesswork.com" }),
    ).toEqual({
      id: "42",
      email: "ada@trustlesswork.com",
      roles: [],
      createdAt: null,
    });
  });

  it("drops non-string role entries", () => {
    expect(
      parseAdminUserRow({
        id: "42",
        email: "ada@trustlesswork.com",
        roles: ["ADMIN", 7, null],
      })?.roles,
    ).toEqual(["ADMIN"]);
  });

  it("treats a non-array roles column as no roles", () => {
    expect(
      parseAdminUserRow({
        id: "42",
        email: "ada@trustlesswork.com",
        roles: "ADMIN",
      })?.roles,
    ).toEqual([]);
  });

  it("treats empty optional strings as null", () => {
    expect(
      parseAdminUserRow({
        id: "42",
        email: "ada@trustlesswork.com",
        created_at: "",
      })?.createdAt,
    ).toBeNull();
  });

  it("rejects rows without a usable identity", () => {
    expect(parseAdminUserRow(null)).toBeNull();
    expect(parseAdminUserRow("row")).toBeNull();
    expect(parseAdminUserRow({})).toBeNull();
    expect(
      parseAdminUserRow({ id: "", email: "ada@trustlesswork.com" }),
    ).toBeNull();
    expect(parseAdminUserRow({ id: "42" })).toBeNull();
    expect(parseAdminUserRow({ id: "42", email: 42 })).toBeNull();
    expect(
      parseAdminUserRow({ id: null, email: "ada@trustlesswork.com" }),
    ).toBeNull();
  });
});

describe("hasAdminRole", () => {
  const base = { id: "42", email: "ada@trustlesswork.com", createdAt: null };

  it("matches regardless of casing and padding", () => {
    expect(hasAdminRole({ ...base, roles: [" admin "] })).toBe(true);
  });

  it("does not treat BACKOFFICE_ADMIN as ADMIN", () => {
    expect(hasAdminRole({ ...base, roles: ["BACKOFFICE_ADMIN"] })).toBe(false);
  });

  it("is false with no roles", () => {
    expect(hasAdminRole({ ...base, roles: [] })).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

describe("isAdminAuthArea", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("returns false on the server", async () => {
    vi.stubGlobal("window", undefined);
    const { isAdminAuthArea } = await import(
      "@/features/auth/lib/logout-client"
    );
    expect(isAdminAuthArea()).toBe(false);
  });

  it("returns true for /admin paths", async () => {
    vi.stubGlobal("window", {
      location: { pathname: "/admin/payroll" },
    });
    const { isAdminAuthArea } = await import(
      "@/features/auth/lib/logout-client"
    );
    expect(isAdminAuthArea()).toBe(true);
  });

  it("returns false for dashboard paths", async () => {
    vi.stubGlobal("window", {
      location: { pathname: "/dashboard/escrows" },
    });
    const { isAdminAuthArea } = await import(
      "@/features/auth/lib/logout-client"
    );
    expect(isAdminAuthArea()).toBe(false);
  });
});

describe("clearClientAuthState on /admin", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("does not wipe wallet storage when on /admin", async () => {
    const removeItem = vi.fn();
    vi.stubGlobal("window", {
      location: { pathname: "/admin/payroll" },
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("localStorage", {
      removeItem,
      getItem: vi.fn(),
      setItem: vi.fn(),
    });

    vi.doMock("@/lib/query-client-holder", () => ({
      getRegisteredQueryClient: () => ({
        setQueryData: vi.fn(),
        removeQueries: vi.fn(),
      }),
    }));
    vi.doMock("@/components/tw-blocks/wallet-kit/wallet-kit", () => ({
      disconnectWalletKitSafe: vi.fn(),
      resetWalletKitLoader: vi.fn(),
    }));

    const { clearClientAuthState } = await import(
      "@/features/auth/lib/logout-client"
    );
    await clearClientAuthState({ reason: "session_expired" });

    expect(removeItem).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import {
  resolveAdminApiKey,
  resolveCoreApiUrl,
  resolvePayrollApiKey,
} from "@/lib/core-target";

const urls = {
  testnetUrl: "https://testnet.example.com/",
  mainnetUrl: "https://mainnet.example.com/",
} as const;

const keys = {
  testnetAdminApiKey: "testnet-admin",
  mainnetAdminApiKey: "mainnet-admin",
} as const;

describe("resolveCoreApiUrl", () => {
  it("uses the testnet host and strips a trailing slash", () => {
    expect(resolveCoreApiUrl("testnet", urls)).toBe(
      "https://testnet.example.com",
    );
  });

  it("uses the mainnet host when the network is mainnet", () => {
    expect(resolveCoreApiUrl("mainnet", urls)).toBe(
      "https://mainnet.example.com",
    );
  });

  it("returns undefined when mainnet url is missing", () => {
    expect(
      resolveCoreApiUrl("mainnet", { ...urls, mainnetUrl: undefined }),
    ).toBeUndefined();
  });
});

describe("resolveAdminApiKey", () => {
  it("keeps testnet and mainnet admin keys apart", () => {
    expect(resolveAdminApiKey("testnet", keys)).toBe("testnet-admin");
    expect(resolveAdminApiKey("mainnet", keys)).toBe("mainnet-admin");
  });

  it("returns undefined when the mainnet admin key is blank", () => {
    expect(
      resolveAdminApiKey("mainnet", { ...keys, mainnetAdminApiKey: "  " }),
    ).toBeUndefined();
  });
});

describe("resolvePayrollApiKey", () => {
  const payrollKeys = {
    testnetPayrollApiKey: "testnet-payroll",
    mainnetPayrollApiKey: "mainnet-payroll",
  } as const;

  it("keeps testnet and mainnet payroll keys apart", () => {
    expect(resolvePayrollApiKey("testnet", payrollKeys)).toBe("testnet-payroll");
    expect(resolvePayrollApiKey("mainnet", payrollKeys)).toBe("mainnet-payroll");
  });

  it("returns undefined when the mainnet payroll key is missing", () => {
    expect(
      resolvePayrollApiKey("mainnet", {
        ...payrollKeys,
        mainnetPayrollApiKey: undefined,
      }),
    ).toBeUndefined();
  });
});

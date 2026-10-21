import { describe, expect, it } from "vitest";
import {
  countActiveEscrowFilters,
  escrowListFiltersToSearchParams,
  parseEscrowListFiltersFromSearchParams,
} from "@/features/escrows/schemas/escrow-list-filters.schema";
import { DEFAULT_ESCROW_LIST_FILTERS } from "@/features/escrows/types/escrow.types";
import { toRestListParams } from "@/features/escrows/utils/escrow-list-params.helper";
import { toDeployPayload } from "@/features/escrows/utils/create-escrow-payload.helper";
import type { CreateEscrowFormData } from "@/features/escrows/schemas/create-escrow.schema";

describe("parseEscrowListFiltersFromSearchParams", () => {
  it("returns defaults for empty params", () => {
    const filters = parseEscrowListFiltersFromSearchParams(
      new URLSearchParams(),
    );

    expect(filters).toEqual(DEFAULT_ESCROW_LIST_FILTERS);
  });

  it("parses all supported filters", () => {
    const params = new URLSearchParams({
      type: "multi-release",
      scope: "all",
      status: "disputed",
      engagementId: "ENG-1",
      contractIds: "C1, C2",
      participant: "GABC",
      role: "approver",
      platformId: "plat-1",
      subjectId: "sub-1",
      createdAfter: "2026-01-01T00:00:00.000Z",
      createdBefore: "2026-02-01T00:00:00.000Z",
      sort: "updatedAt",
      order: "asc",
    });

    const filters = parseEscrowListFiltersFromSearchParams(params);

    expect(filters.type).toBe("multi-release");
    expect(filters.scope).toBe("all");
    expect(filters.status).toBe("disputed");
    expect(filters.engagementId).toBe("ENG-1");
    expect(filters.contractIds).toEqual(["C1", "C2"]);
    expect(filters.participant).toBe("GABC");
    expect(filters.role).toBe("approver");
    expect(filters.platformId).toBe("plat-1");
    expect(filters.subjectId).toBe("sub-1");
    expect(filters.sort).toBe("updatedAt");
    expect(filters.order).toBe("asc");
  });
});

describe("escrowListFiltersToSearchParams", () => {
  it("omits default values from the URL", () => {
    const params = escrowListFiltersToSearchParams(DEFAULT_ESCROW_LIST_FILTERS);
    expect(params.toString()).toBe("");
  });

  it("round-trips non-default filters", () => {
    const filters = {
      ...DEFAULT_ESCROW_LIST_FILTERS,
      type: "multi-release" as const,
      status: "active" as const,
      engagementId: "ENG-9",
      role: "admin" as const,
    };

    const parsed = parseEscrowListFiltersFromSearchParams(
      escrowListFiltersToSearchParams(filters),
    );

    expect(parsed.type).toBe("multi-release");
    expect(parsed.status).toBe("active");
    expect(parsed.engagementId).toBe("ENG-9");
    expect(parsed.role).toBe("admin");
  });

  it("round-trips a contract generation filter", () => {
    const filters = {
      ...DEFAULT_ESCROW_LIST_FILTERS,
      contractVersion: "v2" as const,
    };

    const parsed = parseEscrowListFiltersFromSearchParams(
      escrowListFiltersToSearchParams(filters),
    );

    expect(parsed.contractVersion).toBe("v2");
    expect(escrowListFiltersToSearchParams(DEFAULT_ESCROW_LIST_FILTERS).has(
      "contractVersion",
    )).toBe(false);
  });
});

describe("toRestListParams", () => {
  it("maps filters to REST list params including type", () => {
    const params = toRestListParams(
      {
        ...DEFAULT_ESCROW_LIST_FILTERS,
        type: "multi-release",
        status: "released",
        participant: "GXYZ",
        role: "receiver",
      },
      { cursor: "abc", limit: 10 },
    );

    expect(params).toMatchObject({
      scope: "mine",
      type: "multi-release",
      contractVersion: "all",
      status: "released",
      participant: "GXYZ",
      role: "receiver",
      cursor: "abc",
      limit: 10,
      sort: "createdAt",
      order: "desc",
    });
    expect(params).not.toHaveProperty("contractType");
  });

  it("sends an explicit contract generation filter", () => {
    const params = toRestListParams({
      ...DEFAULT_ESCROW_LIST_FILTERS,
      contractVersion: "v1",
    });

    expect(params.contractVersion).toBe("v1");
  });
});

describe("countActiveEscrowFilters", () => {
  it("ignores type tab when counting", () => {
    expect(
      countActiveEscrowFilters({
        ...DEFAULT_ESCROW_LIST_FILTERS,
        type: "multi-release",
      }),
    ).toBe(0);
  });

  it("counts non-default filters", () => {
    expect(
      countActiveEscrowFilters({
        ...DEFAULT_ESCROW_LIST_FILTERS,
        status: "active",
        engagementId: "x",
        contractVersion: "v1",
      }),
    ).toBe(3);
  });

  it("does not count the default all-generations filter", () => {
    expect(
      countActiveEscrowFilters({
        ...DEFAULT_ESCROW_LIST_FILTERS,
        contractVersion: "all",
      }),
    ).toBe(0);
  });
});

describe("toDeployPayload", () => {
  it("builds single-release deploy trustline with contractId and symbol", () => {
    const values = {
      type: "single-release",
      engagementId: "ENG",
      title: "Title",
      description: "Desc",
      amount: 100,
      platformFee: 2,
      roles: {
        approvers: ["G1"],
        serviceProviders: ["G2"],
        platform: "G3",
        releaseSigners: ["G4"],
        disputeResolvers: ["G5"],
        admin: "G6",
        receiver: "G7",
      },
      milestones: [{ description: "M1", approvalsTarget: 1 }],
      trustline: {
        isCustom: false,
        address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
        symbol: "USDC",
      },
    } as CreateEscrowFormData;

    const payload = toDeployPayload(values, "GSIGNER");

    expect(payload.trustline).toEqual({
      contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
      symbol: "USDC",
    });
    expect(payload).toMatchObject({
      signer: "GSIGNER",
      amount: 100,
    });
  });
});

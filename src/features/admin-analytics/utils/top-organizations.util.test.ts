import { describe, expect, it } from "vitest";
import {
  isTrailingCohortIndex,
  rankTopOrganizations,
} from "@/features/admin-analytics/utils/top-organizations.util";
import type { TopOrganization } from "@/features/admin-analytics/types/analytics.types";

const usdcAsset = {
  address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  symbol: "USDC",
  decimals: 7,
  resolved: true,
};

const orgs: TopOrganization[] = [
  {
    organization: { id: "1", name: "Alpha", archived: false },
    escrowCount: 10,
    byAsset: [
      {
        asset: usdcAsset,
        escrowCount: 10,
        releasedAmount: "100",
        feeAmount: "1",
      },
    ],
  },
  {
    organization: { id: "2", name: "Beta", archived: false },
    escrowCount: 5,
    byAsset: [
      {
        asset: usdcAsset,
        escrowCount: 5,
        releasedAmount: "500",
        feeAmount: "5",
      },
    ],
  },
];

describe("rankTopOrganizations", () => {
  it("ranks by fee when asset is selected", () => {
    const ranked = rankTopOrganizations(orgs, usdcAsset.address);
    expect(ranked[0]?.organization?.id).toBe("2");
  });

  it("ranks by escrow count when no asset is selected", () => {
    const ranked = rankTopOrganizations(orgs, null);
    expect(ranked[0]?.organization?.id).toBe("1");
  });
});

describe("isTrailingCohortIndex", () => {
  it("flags trailing month buckets", () => {
    expect(isTrailingCohortIndex(11, 12, "month")).toBe(true);
    expect(isTrailingCohortIndex(10, 12, "month")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { densifyVolumeVsFeesSeries } from "@/features/admin-analytics/utils/volume-vs-fees.util";
import type { VolumeVsFeesResponse } from "@/features/admin-analytics/types/analytics-v2.types";

const usdcAsset = {
  address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  symbol: "USDC",
  decimals: 7,
  resolved: true,
};

describe("densifyVolumeVsFeesSeries", () => {
  it("fills missing buckets with zero strings", () => {
    const response: VolumeVsFeesResponse = {
      network: "testnet",
      granularity: "month",
      data: [
        {
          period: "2026-07",
          month: "2026-07",
          asset: usdcAsset,
          createdVolume: "100",
          createdCount: 2,
          releasedVolume: "50",
          releasedCount: 1,
          feeAmount: "0.15",
        },
        {
          period: "2026-08",
          month: "2026-08",
          asset: usdcAsset,
          createdVolume: "0",
          createdCount: 0,
          releasedVolume: "80",
          releasedCount: 2,
          feeAmount: "0.24",
        },
      ],
    };

    const series = densifyVolumeVsFeesSeries(
      response,
      usdcAsset.address,
      "month",
    );
    expect(series).toHaveLength(2);
    expect(series[0]?.releasedVolume).toBe("50");
    expect(series[1]?.createdVolume).toBe("0");
  });
});

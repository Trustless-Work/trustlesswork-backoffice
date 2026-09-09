import { describe, expect, it } from "vitest";
import {
  apiKeyDetailResponseSchema,
  apiKeysTopResponseSchema,
} from "@/features/admin-analytics/schemas/analytics-v2.schema";
import {
  apiKeyDisplayName,
  formatApiKeyTopMetric,
} from "@/features/admin-analytics/utils/api-keys.util";

describe("apiKeysTopResponseSchema", () => {
  it("parses flattened core top payload", () => {
    const result = apiKeysTopResponseSchema.safeParse({
      network: "testnet",
      feeBps: 30,
      by: "revenue",
      attribution: "platform",
      data: [
        {
          keyId: "vq0eLSKBaw94luFEiL_0hA",
          description: "tw-probe",
          active: true,
          organization: { id: "22", name: "My Platform", archived: false },
          escrowCount: 2,
          byAsset: [
            {
              asset: {
                address: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
                symbol: "native",
                decimals: 7,
                resolved: true,
              },
              escrowCount: 2,
              releasedAmount: "20",
              feeAmount: "0.06",
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("parses requests ranking with null organization", () => {
    const result = apiKeysTopResponseSchema.safeParse({
      network: "testnet",
      feeBps: 30,
      by: "requests",
      attribution: "platform",
      data: [
        {
          keyId: "VKG2rEGfBMUEUie6e7Pkpg",
          description: "Backoffice",
          active: true,
          organization: null,
          requestCount: "481",
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe("apiKeyDetailResponseSchema", () => {
  it("parses flattened core detail payload", () => {
    const result = apiKeyDetailResponseSchema.safeParse({
      network: "testnet",
      feeBps: 30,
      keyId: "do6K8Fc0VNUPAfmd6PcQow",
      description: "Self-service registration key",
      roles: ["ESCROW_MANAGER"],
      active: true,
      createdAt: "2026-06-26T17:50:10.959Z",
      expiresAt: "2026-09-24T17:50:10.763Z",
      lastUsedAt: null,
      lastUsedIp: null,
      organization: { id: "12", name: "My Platform", archived: false },
      attribution: "platform",
      escrowStats: [
        {
          asset: {
            address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
            symbol: "USDC",
            decimals: 7,
            resolved: true,
          },
          escrowCount: 1,
          releasedAmount: "5",
          feeAmount: "0.015",
        },
      ],
      usage: [],
    });

    expect(result.success).toBe(true);
  });
});

describe("formatApiKeyTopMetric", () => {
  it("formats single-asset fee and multi-asset escrow summary", () => {
    const single = {
      keyId: "a",
      description: "A",
      active: true,
      organization: null,
      escrowCount: 2,
      byAsset: [
        {
          asset: {
            address: "C",
            symbol: "USDC",
            decimals: 7,
            resolved: true,
          },
          escrowCount: 2,
          releasedAmount: "20",
          feeAmount: "0.06",
        },
      ],
    };

    expect(formatApiKeyTopMetric(single, "revenue")).toBe("0.06 USDC");
    expect(formatApiKeyTopMetric(single, "volume")).toBe("20 USDC");
    expect(
      formatApiKeyTopMetric(
        {
          ...single,
          byAsset: [
            ...(single.byAsset ?? []),
            {
              asset: {
                address: "D",
                symbol: "XLM",
                decimals: 7,
                resolved: true,
              },
              escrowCount: 1,
              releasedAmount: "1",
              feeAmount: "0.003",
            },
          ],
        },
        "revenue",
      ),
    ).toBe("2 escrows · 2 assets");
  });
});

describe("apiKeyDisplayName", () => {
  it("prefers description and falls back to truncated id", () => {
    expect(
      apiKeyDisplayName({ keyId: "short", description: "  Named  " }),
    ).toBe("Named");
    expect(
      apiKeyDisplayName({
        keyId: "abcdefghijklmnopqr",
        description: null,
      }),
    ).toBe("abcdefgh…opqr");
  });
});

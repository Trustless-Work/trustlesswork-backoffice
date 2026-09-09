import { describe, expect, it } from "vitest";
import { escrowsTopResponseSchema } from "@/features/admin-analytics/schemas/analytics-v2.schema";

describe("escrowsTopResponseSchema", () => {
  it("parses core escrows/top payloads that omit organization.archived", () => {
    const result = escrowsTopResponseSchema.safeParse({
      network: "testnet",
      feeBps: 30,
      by: "amount",
      data: [
        {
          asset: {
            address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
            symbol: "USDC",
            decimals: 7,
            resolved: true,
          },
          escrows: [
            {
              escrowId: "CAIE42JJDBLAIEDOQHGABUDADYMQVUVL55WAU3SFZMYIEVCTHYC3ARYU",
              engagementId: "ENG-12345",
              type: "single-release",
              status: "active",
              organization: { id: "20", name: "Youyou" },
              createdAt: "2026-07-16T19:39:10.000Z",
              amount: "1000",
              releasedAmount: "0",
              feeAmount: "0",
            },
            {
              escrowId: "CC4QMVJVBEZ4ONCD2JEGX7WNC5XLKRBM7RG4DECWIUSC5TARV3KBBIIX",
              engagementId: "eng-multi-1783917257307",
              type: "multi-release",
              status: "active",
              organization: null,
              createdAt: "2026-07-13T04:34:42.000Z",
              amount: "1000",
              releasedAmount: "0",
              feeAmount: "0",
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.data[0]?.escrows[0]?.organization?.archived).toBe(false);
  });
});

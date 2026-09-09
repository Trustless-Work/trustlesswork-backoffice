import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { parseRequestNetwork } from "@/helpers/request-network.helper";

function createRequest(headers: Record<string, string>): NextRequest {
  return new NextRequest("http://localhost/api/admin/analytics", {
    headers,
  });
}

describe("parseRequestNetwork", () => {
  it("defaults to testnet when the header is missing", () => {
    expect(parseRequestNetwork(createRequest({}))).toBe("testnet");
  });

  it("accepts testnet", () => {
    expect(parseRequestNetwork(createRequest({ "x-network": "testnet" }))).toBe(
      "testnet",
    );
  });

  it("accepts mainnet", () => {
    expect(parseRequestNetwork(createRequest({ "x-network": "mainnet" }))).toBe(
      "mainnet",
    );
  });

  it("falls back to testnet for invalid values", () => {
    expect(parseRequestNetwork(createRequest({ "x-network": "futurenet" }))).toBe(
      "testnet",
    );
  });
});

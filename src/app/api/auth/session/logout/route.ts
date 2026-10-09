import { NextRequest } from "next/server";
import { coreFetch } from "@/lib/core-fetch";
import { clearSessionForNetwork } from "@/lib/session";
import { proxyCoreResponse } from "@/lib/bff-utils";
import { parseRequestNetwork } from "@/helpers/request-network.helper";

export async function POST(request: NextRequest) {
  const network = parseRequestNetwork(request);
  const response = await coreFetch("/auth/session/logout", {
    method: "POST",
    network,
  });

  await clearSessionForNetwork(network);

  if (!response.ok && response.status !== 401) {
    return proxyCoreResponse(response);
  }

  return proxyCoreResponse(
    new Response(JSON.stringify({ loggedOut: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

import { NextRequest } from "next/server";
import { adminFetch } from "@/lib/admin-fetch";
import { createUnauthorizedResponse } from "@/lib/core-fetch";
import { proxyCoreResponse } from "@/lib/bff-utils";
import { parseRequestNetwork } from "@/helpers/request-network.helper";
import { getSessionToken } from "@/lib/session";

export async function GET(request: NextRequest) {
  const network = parseRequestNetwork(request);
  const token = await getSessionToken(network);
  if (!token) {
    return createUnauthorizedResponse();
  }

  const response = await adminFetch("/admin/users", {
    network: parseRequestNetwork(request),
  });
  return proxyCoreResponse(response);
}

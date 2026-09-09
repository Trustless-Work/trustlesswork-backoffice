import type { NextRequest } from "next/server";
import { handleAdminAnalyticsApiKeyDetailGet } from "@/lib/admin-analytics-route";

type RouteContext = {
  params: Promise<{ keyId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { keyId } = await context.params;
  return handleAdminAnalyticsApiKeyDetailGet(request, keyId);
}

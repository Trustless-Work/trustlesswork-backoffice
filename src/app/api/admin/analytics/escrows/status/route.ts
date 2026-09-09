import type { NextRequest } from "next/server";
import { handleAdminAnalyticsRangeGet } from "@/lib/admin-analytics-route";

export async function GET(request: NextRequest) {
  return handleAdminAnalyticsRangeGet(request, "/analytics/escrows/status");
}

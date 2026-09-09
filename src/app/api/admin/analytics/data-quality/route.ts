import type { NextRequest } from "next/server";
import { handleAdminAnalyticsGet } from "@/lib/admin-analytics-route";

export async function GET(request: NextRequest) {
  return handleAdminAnalyticsGet(request, "/analytics/data-quality");
}

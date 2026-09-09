import type { NextRequest } from "next/server";
import { handleAdminAnalyticsMonthlyGet } from "@/lib/admin-analytics-route";

export async function GET(request: NextRequest) {
  return handleAdminAnalyticsMonthlyGet(request, "/analytics/volume-vs-fees");
}

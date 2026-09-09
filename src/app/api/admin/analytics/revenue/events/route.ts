import type { NextRequest } from "next/server";
import { handleAdminAnalyticsRevenueEventsGet } from "@/lib/admin-analytics-route";

export async function GET(request: NextRequest) {
  return handleAdminAnalyticsRevenueEventsGet(request);
}

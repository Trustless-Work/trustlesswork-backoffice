import type { NextRequest } from "next/server";
import { handleAdminAnalyticsTopGet } from "@/lib/admin-analytics-route";

const ALLOWED_BY = ["revenue", "volume", "escrows", "requests"] as const;

export async function GET(request: NextRequest) {
  return handleAdminAnalyticsTopGet(
    request,
    "/analytics/api-keys/top",
    ALLOWED_BY,
  );
}

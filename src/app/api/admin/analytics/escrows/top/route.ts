import type { NextRequest } from "next/server";
import { handleAdminAnalyticsTopGet } from "@/lib/admin-analytics-route";

const ALLOWED_BY = ["amount", "fee"] as const;

export async function GET(request: NextRequest) {
  return handleAdminAnalyticsTopGet(
    request,
    "/analytics/escrows/top",
    ALLOWED_BY,
  );
}

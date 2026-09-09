import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdminSession } from "@/features/admin-auth/services/admin-session.guard";
import { AdminAnalyticsView } from "@/features/admin-analytics/ui/AdminAnalyticsView";
import { AdminAnalyticsSkeleton } from "@/features/admin-analytics/ui/AdminAnalyticsSkeleton";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminHomePage() {
  await requireAdminSession();

  return (
    <Suspense fallback={<AdminAnalyticsSkeleton />}>
      <AdminAnalyticsView />
    </Suspense>
  );
}

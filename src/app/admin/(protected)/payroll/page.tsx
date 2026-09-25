import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdminSession } from "@/features/admin-auth/services/admin-session.guard";
import { PayrollView } from "@/features/payroll/ui/PayrollView";
import { AdminTrustlessWorkProvider } from "@/providers/AdminTrustlessWorkProvider";

export const metadata: Metadata = {
  title: "Payroll",
};

export default async function AdminPayrollPage() {
  await requireAdminSession();

  return (
    <AdminTrustlessWorkProvider>
      <Suspense fallback={null}>
        <PayrollView />
      </Suspense>
    </AdminTrustlessWorkProvider>
  );
}

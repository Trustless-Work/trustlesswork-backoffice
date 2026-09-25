import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdminSession } from "@/features/admin-auth/services/admin-session.guard";
import { PayrollRunDetail } from "@/features/payroll/ui/PayrollRunDetail";
import { AdminTrustlessWorkProvider } from "@/providers/AdminTrustlessWorkProvider";

type AdminPayrollDetailPageProps = {
  params: Promise<{ contractId: string }>;
};

export const metadata: Metadata = {
  title: "Payroll run",
};

export default async function AdminPayrollDetailPage({
  params,
}: AdminPayrollDetailPageProps) {
  await requireAdminSession();
  const { contractId } = await params;

  return (
    <AdminTrustlessWorkProvider>
      <Suspense fallback={null}>
        <PayrollRunDetail contractId={contractId} />
      </Suspense>
    </AdminTrustlessWorkProvider>
  );
}

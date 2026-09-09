"use client";

import Link from "next/link";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { ADMIN_LOGIN_PATH } from "@/features/admin-auth/constants/admin-auth.constants";

/**
 * Note: `redirect()` from the guard is not an error — Next.js handles it before
 * this boundary. This only catches genuine failures (Supabase unreachable, a
 * database error), so it must not leak the message.
 */
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <Container className="flex flex-col items-start gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          We could not load this backoffice page. Try again, or sign in once
          more if the problem persists.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={reset}>
          <RotateCcwIcon data-icon="inline-start" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href={ADMIN_LOGIN_PATH}>Back to sign in</Link>
        </Button>
      </div>
    </Container>
  );
}

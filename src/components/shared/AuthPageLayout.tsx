"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingPaths } from "@/components/ui/floating-paths";

/**
 * Split-screen shell for unauthenticated pages.
 *
 * Lives in `components/shared/` rather than a feature folder because both auth
 * systems use it: the wallet `/login` view and the Supabase `/admin/login` view.
 * A feature importing another feature's UI is not allowed, and duplicating this
 * would be worse.
 *
 * Every prop is optional and defaults to the original wallet-login copy, so
 * `/login` renders exactly as before.
 */
type AuthPageLayoutProps = {
  children: React.ReactNode;
  quote?: string;
  attribution?: string;
  homeHref?: string;
};

export const AuthPageLayout = ({
  children,
  quote = "Integrate trust in hours, not months.",
  attribution = "~ Trustless Work",
  homeHref = "/",
}: AuthPageLayoutProps) => {
  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <section className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/10">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />

        <div className="relative z-10 mt-auto">
          <blockquote className="flex flex-col gap-2">
            <p className="text-xl">&ldquo;{quote}&rdquo;</p>
            <footer className="font-mono text-sm font-semibold">
              {attribution}
            </footer>
          </blockquote>
        </div>

        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </section>

      <section className="relative flex min-h-screen flex-col justify-center overflow-y-auto px-8 lg:h-full lg:min-h-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-60"
        >
          <div className="absolute -top-1/3 -right-1/4 size-[160%] rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-1/2 -right-1/4 size-[130%] -translate-y-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
          <div className="absolute -bottom-1/3 -right-1/4 size-[150%] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
        </div>

        <Button asChild className="absolute top-7 left-5" variant="ghost">
          <Link href={homeHref}>
            <ChevronLeftIcon data-icon="inline-start" />
            Home
          </Link>
        </Button>

        <div className="mx-auto flex w-full max-w-sm flex-col gap-4 py-16">
          <Link href={homeHref} className="mx-auto">
            <Image
              src="/icon.png"
              alt="Trustless Work"
              width={100}
              height={100}
              className="mx-auto mb-10"
            />
          </Link>

          {children}
        </div>
      </section>
    </main>
  );
};

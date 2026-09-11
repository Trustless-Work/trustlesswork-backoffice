import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EscrowType } from "@/features/escrows/types/escrow.types";

type EscrowDetailSkeletonProps = {
  type?: EscrowType;
};

const OverviewStatSkeleton = () => (
  <div>
    <Skeleton className="h-4 w-20" />
    <Skeleton className="mt-2 h-7 w-28" />
  </div>
);

const RoleItemSkeleton = () => (
  <div className="min-w-0 rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
    <div className="flex items-start gap-3">
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ActionGroupSkeleton = () => (
  <div className="rounded-2xl border border-border bg-muted/40 p-4">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="mt-2 h-3 w-full max-w-xs" />
    <div className="mt-3 flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-full" />
      ))}
    </div>
  </div>
);

const MilestoneRowSkeleton = ({ isMulti }: { isMulti: boolean }) => (
  <TableRow>
    <TableCell className="px-5 py-5">
      <Skeleton className="size-4 rounded-[4px]" />
    </TableCell>
    <TableCell className="px-5 py-5">
      <Skeleton className="h-4 w-4" />
    </TableCell>
    <TableCell className="px-5 py-5">
      <div className="flex items-start gap-2">
        <Skeleton className="h-4 w-full max-w-xs" />
        <Skeleton className="mt-1 size-2.5 shrink-0 rounded-full" />
      </div>
    </TableCell>
    <TableCell className="px-5 py-5">
      <Skeleton className="h-6 w-20 rounded-full" />
    </TableCell>
    {isMulti ? (
      <>
        <TableCell className="px-5 py-5">
          <Skeleton className="ml-auto h-4 w-16" />
        </TableCell>
        <TableCell className="px-5 py-5">
          <Skeleton className="h-4 w-24" />
        </TableCell>
      </>
    ) : null}
    <TableCell className="px-5 py-5">
      <Skeleton className="ml-auto h-4 w-10" />
    </TableCell>
    <TableCell className="px-5 py-5">
      <div className="flex justify-end gap-1">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </TableCell>
  </TableRow>
);

const MilestoneCardSkeleton = ({ isMulti }: { isMulti: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-start justify-between gap-3 pb-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Skeleton className="mt-1 size-4 shrink-0 rounded-[4px]" />
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <Skeleton className="h-5 w-full max-w-xs" />
          <Skeleton className="mt-1 size-2.5 shrink-0 rounded-full" />
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: isMulti ? 4 : 2 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </CardContent>
  </Card>
);

export const EscrowDetailSkeleton = ({
  type = "multi-release",
}: EscrowDetailSkeletonProps) => {
  const isMulti = type === "multi-release";
  const columnCount = isMulti ? 8 : 6;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-36 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-8 w-2/3 max-w-md" />
                <Skeleton className="h-16 w-full max-w-2xl" />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="size-10 rounded-full" />
              </div>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <OverviewStatSkeleton key={index} />
              ))}
            </dl>
            <div className="mt-6 border-t border-border pt-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-12 w-full rounded-full" />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <ActionGroupSkeleton />
            <ActionGroupSkeleton />
            <ActionGroupSkeleton />
          </aside>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="mt-2 h-4 w-64" />
        <div className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-2">
          {Array.from({ length: isMulti ? 7 : 8 }).map((_, index) => (
            <RoleItemSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="mt-6 flex flex-col gap-4 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <MilestoneCardSkeleton key={index} isMulti={isMulti} />
          ))}
        </div>

        <div className="mt-6 hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, index) => (
                  <TableHead key={index} className="h-auto px-5 py-4">
                    <Skeleton className="h-3 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, index) => (
                <MilestoneRowSkeleton key={index} isMulti={isMulti} />
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="mt-2 h-4 w-48" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-2 h-4 w-52" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

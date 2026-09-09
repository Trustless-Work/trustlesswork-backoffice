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

export const RevenueEventsTableSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-3 md:hidden">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((__, cellIndex) => (
              <div key={cellIndex} className="flex flex-col gap-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-16" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              {Array.from({ length: 8 }).map((__, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <Skeleton className="h-4 w-36" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  </div>
);

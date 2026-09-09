"use client";

import { KeyIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NoData } from "@/components/shared/NoData";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiKeysTopBy } from "@/features/admin-analytics/types/analytics-v2.types";
import type { ApiKeyTopItem } from "@/features/admin-analytics/utils/api-keys.util";
import {
  apiKeyDisplayName,
  apiKeysTopMetricLabel,
  formatApiKeyTopMetric,
  truncateApiKeyId,
} from "@/features/admin-analytics/utils/api-keys.util";
import { formatOrganizationName } from "@/features/admin-analytics/utils/revenue.util";

type TopApiKeysBoardProps = {
  by: ApiKeysTopBy;
  items: readonly ApiKeyTopItem[];
  isPending: boolean;
  errorMessage: string | null;
  onSelectKey: (keyId: string) => void;
};

export const TopApiKeysBoard = ({
  by,
  items,
  isPending,
  errorMessage,
  onSelectKey,
}: TopApiKeysBoardProps) => {
  const metricLabel = apiKeysTopMetricLabel(by);

  if (isPending) {
    return (
      <DashboardCard className="gap-4">
        <div className="flex flex-col gap-3 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-2 h-3 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">{metricLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-14" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="gap-4">
      {errorMessage ? (
        <p className="text-pretty text-muted-foreground text-sm">
          {errorMessage}
        </p>
      ) : items.length === 0 ? (
        <NoData
          icon={KeyIcon}
          title="No API keys"
          description="No keys match the selected range and ranking."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {items.map((item) => (
              <Card
                key={item.keyId}
                className="cursor-pointer"
                onClick={() => onSelectKey(item.keyId)}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="truncate text-sm">
                      {apiKeyDisplayName(item)}
                    </CardTitle>
                    <p className="text-muted-foreground text-xs">
                      {formatOrganizationName(item.organization)}
                    </p>
                  </div>
                  <Badge variant={item.active ? "default" : "secondary"}>
                    {item.active ? "Active" : "Inactive"}
                  </Badge>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground text-xs">Key</span>
                    <p className="font-mono text-xs">
                      {truncateApiKeyId(item.keyId)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      {metricLabel}
                    </span>
                    <p className="text-sm tabular-nums">
                      {formatApiKeyTopMetric(item, by)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">{metricLabel}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.keyId}
                    className="cursor-pointer"
                    onClick={() => onSelectKey(item.keyId)}
                  >
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">
                          {apiKeyDisplayName(item)}
                        </span>
                        <span className="font-mono text-muted-foreground text-xs">
                          {truncateApiKeyId(item.keyId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatOrganizationName(item.organization)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.active ? "default" : "secondary"}>
                        {item.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatApiKeyTopMetric(item, by)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </DashboardCard>
  );
};

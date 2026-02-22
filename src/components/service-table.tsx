"use client";

import { useState, useMemo, Fragment } from "react";
import { useOverview } from "@/hooks/use-overview";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { ServiceRow as ServiceRowType } from "@/lib/railway/types";
import type { Health } from "@/lib/railway/types";
import {
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { LogsDrawer } from "@/components/logs-drawer";

type FilterStatus = "all" | "failing" | "deploying" | "healthy";

const FILTER_MAP: Record<FilterStatus, Health[] | null> = {
  all: null,
  failing: ["DOWN", "DEGRADED"],
  deploying: ["DEPLOYING"],
  healthy: ["HEALTHY"],
};

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function groupByProject(rows: ServiceRowType[]): Map<string, ServiceRowType[]> {
  const map = new Map<string, ServiceRowType[]>();
  for (const row of rows) {
    const key = row.projectId;
    const arr = map.get(key) ?? [];
    arr.push(row);
    map.set(key, arr);
  }
  return map;
}

export function ServiceTable() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [onlyProd, setOnlyProd] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    () => new Set()
  );
  const [logsService, setLogsService] = useState<ServiceRowType | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useOverview({
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    let rows = [...data];

    if (onlyProd) {
      rows = rows.filter(
        (r) =>
          r.environmentName.toLowerCase() === "production" ||
          r.environmentName.toLowerCase() === "prod"
      );
    }

    const filterHealths = FILTER_MAP[filter];
    if (filterHealths) {
      rows = rows.filter((r) => filterHealths.includes(r.health));
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      rows = rows.filter(
        (r) =>
          r.projectName.toLowerCase().includes(q) ||
          r.serviceName.toLowerCase().includes(q)
      );
    }

    return rows;
  }, [data, filter, onlyProd, search]);

  const grouped = useMemo(() => groupByProject(filtered), [filtered]);

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search project or service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          {(
            [
              ["all", "All"],
              ["failing", "Failing"],
              ["deploying", "Deploying"],
              ["healthy", "Healthy"],
            ] as const
          ).map(([k, label]) => (
            <Button
              key={k}
              variant={filter === k ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(k)}
            >
              {label}
            </Button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyProd}
            onChange={(e) => setOnlyProd(e.target.checked)}
          />
          Only prod
        </label>
        <div className="flex items-center gap-2">
          <Switch
            checked={autoRefresh}
            onCheckedChange={setAutoRefresh}
          />
          <span className="text-sm text-muted-foreground">Auto-refresh</span>
        </div>
        {autoRefresh && (
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            <option value={15}>15s</option>
            <option value={30}>30s</option>
            <option value={60}>60s</option>
          </select>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error.message}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Loading services...
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No services match your filters.
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Project</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last deploy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(grouped.entries()).map(([projectId, rows]) => {
                const projectName = rows[0]?.projectName ?? "—";
                const isExpanded =
                  expandedProjects.has(projectId) || grouped.size === 1;

                return (
                  <Fragment key={projectId}>
                    <TableRow
                      key={projectId}
                      className="cursor-pointer bg-muted/30"
                      onClick={() => toggleProject(projectId)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell colSpan={2}>
                        <span className="font-medium">{projectName}</span>
                        <Badge variant="secondary" className="ml-2">
                          {rows.length} service{rows.length !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                    {isExpanded &&
                      rows.map((row) => (
                        <TableRow
                          key={`${row.serviceId}-${row.environmentId}`}
                          className="bg-background"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TableCell />
                          <TableCell className="text-muted-foreground">
                            {row.projectName}
                          </TableCell>
                          <TableCell>{row.serviceName}</TableCell>
                          <TableCell>{row.environmentName}</TableCell>
                          <TableCell>
                            <StatusBadge health={row.health} />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(row.lastDeployAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View logs"
                                onClick={() => setLogsService(row)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              {row.railwayUrl && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Open Railway"
                                  asChild
                                >
                                  <a
                                    href={row.railwayUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <LogsDrawer
        service={logsService}
        onClose={() => setLogsService(null)}
      />
    </div>
  );
}

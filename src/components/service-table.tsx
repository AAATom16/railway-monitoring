"use client";

import { useState, useMemo, Fragment } from "react";
import { useOverview } from "@/hooks/use-overview";
import { usePinnedProjects } from "@/hooks/use-pinned-projects";
import { useFailureNotifications } from "@/hooks/use-failure-notifications";
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
  RotateCw,
  Star,
  LayoutGrid,
  List,
} from "lucide-react";
import { LogsDrawer } from "@/components/logs-drawer";

type ViewMode = "table" | "cards";

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
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    () => new Set()
  );
  const [logsService, setLogsService] = useState<ServiceRowType | null>(null);
  const [redeployingKey, setRedeployingKey] = useState<string | null>(null);

  const { pinned, togglePin, isPinned } = usePinnedProjects();
  const { data, isLoading, error, refetch, isFetching } = useOverview({
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });
  useFailureNotifications(data);

  const handleRedeploy = async (row: ServiceRowType) => {
    const key = `${row.serviceId}-${row.environmentId}`;
    setRedeployingKey(key);
    try {
      const res = await fetch("/api/redeploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: row.serviceId,
          environmentId: row.environmentId,
        }),
      });
      if (res.ok) {
        refetch();
      }
    } finally {
      setRedeployingKey(null);
    }
  };

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

  const sortedGroupedEntries = useMemo(() => {
    const entries = Array.from(grouped.entries());
    if (pinned.size === 0) return entries;
    return entries.sort(([a], [b]) => {
      const aPinned = pinned.has(a);
      const bPinned = pinned.has(b);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [grouped, pinned]);

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
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2"
            onClick={() => setViewMode("table")}
            title="Table view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2"
            onClick={() => setViewMode("cards")}
            title="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
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
          {data && data.length === 0 ? (
            <p>No services found. Add projects to your Railway workspaces.</p>
          ) : (
            <p>No services match your filters. Try clearing the search or changing the filter.</p>
          )}
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && viewMode === "table" && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
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
              {sortedGroupedEntries.map(([projectId, rows]) => {
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
                      <TableCell
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(projectId);
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${isPinned(projectId) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
                          title={isPinned(projectId) ? "Unpin project" : "Pin project to top"}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
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
                                title="Redeploy"
                                onClick={() => handleRedeploy(row)}
                                disabled={
                                  redeployingKey ===
                                  `${row.serviceId}-${row.environmentId}`
                                }
                              >
                                <RotateCw
                                  className={`h-4 w-4 ${
                                    redeployingKey ===
                                    `${row.serviceId}-${row.environmentId}`
                                      ? "animate-spin"
                                      : ""
                                  }`}
                                />
                              </Button>
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

      {!isLoading && !error && filtered.length > 0 && viewMode === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedGroupedEntries.map(([projectId, rows]) => {
            const projectName = rows[0]?.projectName ?? "—";
            const railwayUrl = rows[0]?.railwayUrl;
            return (
              <div
                key={projectId}
                className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 shrink-0 ${isPinned(projectId) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
                      title={isPinned(projectId) ? "Unpin" : "Pin to top"}
                      onClick={() => togglePin(projectId)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <h3 className="font-semibold truncate">{projectName}</h3>
                  </div>
                  {railwayUrl && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                      <a href={railwayUrl} target="_blank" rel="noopener noreferrer" title="Open in Railway">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
                <ul className="space-y-2">
                  {rows.map((row) => (
                    <li
                      key={`${row.serviceId}-${row.environmentId}`}
                      className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-sm block truncate">{row.serviceName}</span>
                        <span className="text-xs text-muted-foreground">{row.environmentName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge health={row.health} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Redeploy"
                          onClick={() => handleRedeploy(row)}
                          disabled={
                            redeployingKey ===
                            `${row.serviceId}-${row.environmentId}`
                          }
                        >
                          <RotateCw
                            className={`h-4 w-4 ${
                              redeployingKey ===
                              `${row.serviceId}-${row.environmentId}`
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="View logs"
                          onClick={() => setLogsService(row)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <LogsDrawer
        service={logsService}
        onClose={() => setLogsService(null)}
      />
    </div>
  );
}

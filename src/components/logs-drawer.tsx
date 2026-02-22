"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import type { ServiceRow } from "@/lib/railway/types";
import { X } from "lucide-react";

interface LogsDrawerProps {
  service: ServiceRow | null;
  onClose: () => void;
}

export function LogsDrawer({ service, onClose }: LogsDrawerProps) {
  const [filter, setFilter] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const open = !!service;

  const loadLogs = useCallback(async () => {
    if (!service || !service.environmentId) return;
    setLoading(true);
    try {
      const envId = service.environmentId || undefined;
      const params = new URLSearchParams({ lines: "200" });
      if (envId) params.set("envId", envId);
      const res = await fetch(
        `/api/logs/${service.serviceId}?${params.toString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data.logs) ? data.logs : []);
      } else {
        setLogs([`Error: ${res.status} ${await res.text()}`]);
      }
    } catch (e) {
      setLogs([`Error: ${e instanceof Error ? e.message : "Failed to fetch"}`]);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    if (service && open && !live) {
      loadLogs();
    }
  }, [service?.serviceId, service?.environmentId, open, live, loadLogs]);

  useEffect(() => {
    if (!live || !service?.environmentId) {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      return;
    }
    const params = new URLSearchParams({
      serviceId: service.serviceId,
      envId: service.environmentId,
    });
    const es = new EventSource(`/api/logs/stream?${params.toString()}`);
    eventSourceRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.line) {
          setLogs((prev) => [...prev, data.line]);
        }
      } catch {
        // ignore parse errors
      }
    };
    es.onerror = () => es.close();
    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [live, service]);

  const filteredLogs = filter.trim()
    ? logs.filter((line) =>
        line.toLowerCase().includes(filter.toLowerCase().trim())
      )
    : logs;

  if (!service) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      side="right"
    >
      <SheetContent className="w-full max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span>{service.serviceName}</span>
            <StatusBadge health={service.health} />
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {service.projectName} • {service.environmentName}
          </p>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0 mt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button onClick={loadLogs} disabled={loading}>
              {loading ? "Loading..." : "Load logs"}
            </Button>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={live}
                onChange={(e) => setLive(e.target.checked)}
              />
              Live
            </label>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto rounded border bg-muted/30 p-4 font-mono text-xs">
            {logs.length === 0 && !loading && !service.environmentId && (
              <p className="text-muted-foreground">
                No environment selected. Logs are available per environment.
              </p>
            )}
          {logs.length === 0 && !loading && service.environmentId && (
              <p className="text-muted-foreground">
                Click &quot;Load logs&quot; to fetch logs.
              </p>
            )}
            {loading && <p className="text-muted-foreground">Loading...</p>}
            {!loading &&
              filteredLogs.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-all">
                  {line}
                </div>
              ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

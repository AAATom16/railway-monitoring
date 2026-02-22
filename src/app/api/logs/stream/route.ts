import { NextRequest } from "next/server";
import { railwayGraphql } from "@/lib/railway/client";
import { ENVIRONMENT_LOGS_QUERY } from "@/lib/railway/logs";

export const dynamic = "force-dynamic";

interface LogEntry {
  message?: string | null;
  timestamp?: string | null;
}

interface LogsResponse {
  environmentLogs?: LogEntry[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const envId = searchParams.get("envId");

  if (!serviceId || !envId) {
    return new Response("Missing serviceId or envId", { status: 400 });
  }

  const encoder = new TextEncoder();
  let lastTimestamp: string | null = null;
  const ac = new AbortController();

  request.signal.addEventListener("abort", () => ac.abort());

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        if (ac.signal.aborted) return;
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const poll = async () => {
        if (ac.signal.aborted) return;
        try {
          const data = await railwayGraphql<LogsResponse>(
            ENVIRONMENT_LOGS_QUERY,
            {
              environmentId: envId,
              filter: `@service:${serviceId}`,
              beforeLimit: 50,
            }
          );

          const rawLogs = (data.environmentLogs ?? []).reverse();
          const newLogs = lastTimestamp
            ? rawLogs.filter(
                (e) => e.timestamp && e.timestamp > lastTimestamp!
              )
            : rawLogs;

          if (newLogs.length > 0) {
            const latest = newLogs[newLogs.length - 1];
            if (latest.timestamp) lastTimestamp = latest.timestamp;
            for (const entry of newLogs) {
              const msg = entry.message ?? "";
              const ts = entry.timestamp
                ? new Date(entry.timestamp).toISOString()
                : "";
              send(
                JSON.stringify({
                  line: ts ? `[${ts}] ${msg}` : msg,
                })
              );
            }
          }
        } catch (err) {
          send(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Failed to fetch",
            })
          );
        }
      };

      send(JSON.stringify({ event: "connected" }));
      await poll();
      const interval = setInterval(poll, 3000);

      ac.signal.addEventListener(
        "abort",
        () => {
          clearInterval(interval);
          controller.close();
        },
        { once: true }
      );
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

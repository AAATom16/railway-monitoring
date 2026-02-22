import { NextRequest, NextResponse } from "next/server";
import { railwayGraphql } from "@/lib/railway/client";
import { ENVIRONMENT_LOGS_QUERY } from "@/lib/railway/logs";

interface LogEntry {
  message?: string | null;
  severity?: string | null;
  timestamp?: string | null;
  tags?: { deploymentId?: string; serviceId?: string } | null;
}

interface LogsResponse {
  environmentLogs?: LogEntry[];
}

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  const { searchParams } = new URL(request.url);
  const envId = searchParams.get("envId");
  const lines = Math.min(
    Math.max(parseInt(searchParams.get("lines") ?? "200", 10) || 200, 1),
    500
  );

  if (!envId) {
    return NextResponse.json(
      { error: "envId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const data = await railwayGraphql<LogsResponse>(ENVIRONMENT_LOGS_QUERY, {
      environmentId: envId,
      filter: `@service:${serviceId}`,
      beforeLimit: lines,
    });

    const rawLogs = data.environmentLogs ?? [];
    const logs = rawLogs.map((entry) => {
      const msg = entry.message ?? "";
      const ts = entry.timestamp
        ? new Date(entry.timestamp).toISOString()
        : "";
      return ts ? `[${ts}] ${msg}` : msg;
    });

    return NextResponse.json({ logs });
  } catch (err) {
    console.error("Logs API error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to fetch logs",
      },
      { status: 500 }
    );
  }
}

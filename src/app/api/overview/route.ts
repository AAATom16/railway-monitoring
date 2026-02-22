import { NextResponse } from "next/server";
import { railwayGraphql } from "@/lib/railway/client";
import { OVERVIEW_QUERY } from "@/lib/railway/queries";
import {
  transformOverviewToServiceRows,
  type OverviewResponse,
} from "@/lib/railway/transform";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await railwayGraphql<OverviewResponse>(OVERVIEW_QUERY);
    const rows = transformOverviewToServiceRows(data);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Overview API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch overview" },
      { status: 401 }
    );
  }
}

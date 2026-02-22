import { NextRequest, NextResponse } from "next/server";
import { railwayGraphql } from "@/lib/railway/client";
import { REDEPLOY_MUTATION } from "@/lib/railway/mutations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, environmentId } = body;

    if (!serviceId || !environmentId) {
      return NextResponse.json(
        { error: "serviceId and environmentId are required" },
        { status: 400 }
      );
    }

    const data = await railwayGraphql<{
      serviceInstanceRedeploy: string;
    }>(REDEPLOY_MUTATION, {
      serviceId: String(serviceId),
      environmentId: String(environmentId),
    });

    const deploymentId = data?.serviceInstanceRedeploy;
    return NextResponse.json({ deploymentId });
  } catch (err) {
    console.error("[Redeploy API] Error:", err);
    const message = err instanceof Error ? err.message : "Redeploy failed";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

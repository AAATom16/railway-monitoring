"use client";

import { useQuery } from "@tanstack/react-query";
import type { ServiceRow } from "@/lib/railway/types";

async function fetchOverview(): Promise<ServiceRow[]> {
  const res = await fetch("/api/overview");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch overview");
  }
  return res.json();
}

export function useOverview(options?: {
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
}) {
  return useQuery({
    queryKey: ["overview"],
    queryFn: fetchOverview,
    refetchInterval:
      options?.refetchInterval !== undefined
        ? options.refetchInterval
        : 30_000,
    refetchIntervalInBackground: options?.refetchIntervalInBackground ?? true,
  });
}

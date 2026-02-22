"use client";

import { Badge } from "@/components/ui/badge";
import type { Health } from "@/lib/railway/types";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  HelpCircle,
} from "lucide-react";

const HEALTH_CONFIG: Record<
  Health,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; Icon: typeof CheckCircle2 }
> = {
  HEALTHY: {
    label: "Running",
    variant: "success",
    Icon: CheckCircle2,
  },
  DEPLOYING: {
    label: "Deploying",
    variant: "warning",
    Icon: Loader2,
  },
  DEGRADED: {
    label: "Degraded",
    variant: "warning",
    Icon: AlertCircle,
  },
  DOWN: {
    label: "Failed",
    variant: "destructive",
    Icon: XCircle,
  },
  UNKNOWN: {
    label: "Unknown",
    variant: "secondary",
    Icon: HelpCircle,
  },
};

export function StatusBadge({ health }: { health: Health }) {
  const config = HEALTH_CONFIG[health];
  const Icon = config.Icon;

  return (
    <Badge
      variant={config.variant}
      className={`gap-1.5 ${health === "DEPLOYING" ? "animate-pulse" : ""}`}
    >
      {health === "DEPLOYING" && (
        <Icon className="h-3.5 w-3.5 animate-spin" />
      )}
      {health !== "DEPLOYING" && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  );
}

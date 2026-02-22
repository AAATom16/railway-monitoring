import type { Health } from "./railway/types";

const HEALTH_ORDER: Record<Health, number> = {
  DOWN: 0,
  DEGRADED: 1,
  DEPLOYING: 2,
  HEALTHY: 3,
  UNKNOWN: 4,
};

export function deploymentStatusToHealth(
  status?: string | null
): Health {
  if (!status) return "UNKNOWN";

  const s = status.toUpperCase();

  if (s === "FAILED" || s === "CRASHED" || s === "REMOVED") return "DOWN";
  if (s === "BUILDING" || s === "DEPLOYING" || s === "QUEUED" || s === "WAITING")
    return "DEPLOYING";
  if (s === "SUCCESS") return "HEALTHY";
  if (s === "SLEEPING") return "DEGRADED";

  return "UNKNOWN";
}

export function worstHealth(healths: Health[]): Health {
  if (healths.length === 0) return "UNKNOWN";
  return healths.reduce((worst, h) =>
    HEALTH_ORDER[h] < HEALTH_ORDER[worst] ? h : worst
  );
}

export type Health = "HEALTHY" | "DEPLOYING" | "DEGRADED" | "DOWN" | "UNKNOWN";

export type LastDeployStatus =
  | "SUCCESS"
  | "FAILED"
  | "BUILDING"
  | "DEPLOYING"
  | "CANCELED"
  | "CRASHED"
  | "QUEUED"
  | "REMOVED"
  | "SKIPPED"
  | "SLEEPING"
  | "WAITING";

export interface ServiceRow {
  projectId: string;
  projectName: string;
  serviceId: string;
  serviceName: string;
  environmentId: string;
  environmentName: string;
  health: Health;
  lastDeployStatus?: LastDeployStatus;
  lastDeployAt?: string;
  railwayUrl?: string;
}

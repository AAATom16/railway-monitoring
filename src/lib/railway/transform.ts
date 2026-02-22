import type { ServiceRow } from "./types";
import { deploymentStatusToHealth } from "@/lib/health";

interface WorkspaceNode {
  id: string;
  name: string;
  team?: {
    id: string;
    projects?: {
      edges?: Array<{
        node: {
          id: string;
          name: string;
          services?: {
            edges?: Array<{
              node: {
                id: string;
                name: string;
                serviceInstances?: {
                  edges?: Array<{
                    node: {
                      id: string;
                      environment?: {
                        id: string;
                        name: string;
                      };
                      latestDeployment?: {
                        id: string;
                        status?: string;
                        createdAt?: string;
                        meta?: Record<string, unknown>;
                      } | null;
                    };
                  }>;
                };
              };
            }>;
          };
        };
      }>;
    };
  };
}

export interface OverviewResponse {
  me?: {
    workspaces?: WorkspaceNode[];
  };
}

export function transformOverviewToServiceRows(data: OverviewResponse): ServiceRow[] {
  const rows: ServiceRow[] = [];
  const workspaces = data.me?.workspaces ?? [];

  for (const workspace of workspaces) {
    const projects = workspace.team?.projects?.edges ?? [];
    for (const projectEdge of projects) {
      const project = projectEdge.node;
      const projectId = project.id;
      const projectName = project.name;

      const services = project.services?.edges ?? [];
      for (const serviceEdge of services) {
        const service = serviceEdge.node;
        const serviceId = service.id;
        const serviceName = service.name;

        const instances = service.serviceInstances?.edges ?? [];
        for (const instanceEdge of instances) {
          const instance = instanceEdge.node;
          const env = instance.environment;
          const deployment = instance.latestDeployment;

          if (!env) continue;

          const health = deploymentStatusToHealth(deployment?.status);
          const lastDeployStatus = deployment?.status as ServiceRow["lastDeployStatus"];
          const lastDeployAt = deployment?.createdAt;

          rows.push({
            projectId,
            projectName,
            serviceId,
            serviceName,
            environmentId: env.id,
            environmentName: env.name,
            health,
            lastDeployStatus,
            lastDeployAt,
            railwayUrl: `https://railway.app/project/${projectId}?environmentId=${env.id}`,
          });
        }

        if (instances.length === 0) {
          rows.push({
            projectId,
            projectName,
            serviceId,
            serviceName,
            environmentId: "",
            environmentName: "—",
            health: "UNKNOWN",
            railwayUrl: `https://railway.app/project/${projectId}`,
          });
        }
      }
    }
  }

  return rows;
}

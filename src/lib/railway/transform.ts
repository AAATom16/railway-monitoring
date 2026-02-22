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
          environments?: {
            edges?: Array<{
              node: { id: string; name: string };
            }>;
          };
          services?: {
            edges?: Array<{
              node: {
                id: string;
                name: string;
                serviceInstances?: {
                  edges?: Array<{
                    node: {
                      id: string;
                      environmentId: string;
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

function buildEnvMap(
  envEdges: Array<{ node: { id: string; name: string } }> | undefined
): Map<string, string> {
  const map = new Map<string, string>();
  for (const edge of envEdges ?? []) {
    map.set(edge.node.id, edge.node.name);
  }
  return map;
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
      const envMap = buildEnvMap(project.environments?.edges);

      const services = project.services?.edges ?? [];
      for (const serviceEdge of services) {
        const service = serviceEdge.node;
        const serviceId = service.id;
        const serviceName = service.name;

        const instances = service.serviceInstances?.edges ?? [];
        for (const instanceEdge of instances) {
          const instance = instanceEdge.node;
          const envId = instance.environmentId;
          const envName = envMap.get(envId) ?? "unknown";
          const deployment = instance.latestDeployment;

          const health = deploymentStatusToHealth(deployment?.status);
          const lastDeployStatus = deployment?.status as ServiceRow["lastDeployStatus"];
          const lastDeployAt = deployment?.createdAt;

          rows.push({
            projectId,
            projectName,
            serviceId,
            serviceName,
            environmentId: envId,
            environmentName: envName,
            health,
            lastDeployStatus,
            lastDeployAt,
            railwayUrl: `https://railway.app/project/${projectId}?environmentId=${envId}`,
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

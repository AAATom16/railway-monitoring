export const REDEPLOY_MUTATION = `
  mutation serviceInstanceRedeploy($environmentId: String!, $serviceId: String!) {
    serviceInstanceRedeploy(environmentId: $environmentId, serviceId: $serviceId)
  }
`;

export const ENVIRONMENT_LOGS_QUERY = `
  query environmentLogs(
    $environmentId: String!
    $filter: String
    $beforeLimit: Int
  ) {
    environmentLogs(
      environmentId: $environmentId
      filter: $filter
      beforeLimit: $beforeLimit
    ) {
      message
      severity
      timestamp
      tags {
        deploymentId
        serviceId
      }
    }
  }
`;

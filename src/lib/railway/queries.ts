export const OVERVIEW_QUERY = `
  query overview {
    me {
      workspaces {
        id
        name
        projects {
          edges {
            node {
              id
              name
              environments {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
              services {
                edges {
                  node {
                    id
                    name
                    serviceInstances {
                      edges {
                        node {
                          id
                          environmentId
                          latestDeployment {
                            id
                            status
                            createdAt
                            meta
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

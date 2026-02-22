export const OVERVIEW_QUERY = `
  query overview {
    me {
      workspaces {
        id
        name
        team {
          id
          projects {
            edges {
              node {
                id
                name
                services {
                  edges {
                    node {
                      id
                      name
                      serviceInstances {
                        edges {
                          node {
                            id
                            environment {
                              id
                              name
                            }
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
  }
`;

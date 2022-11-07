/**
 * Run the GraphQl query to get project and column information
 *
 * @param {octokit} octokit - Octokit instance
 * @param {string} url - Issue or Pull request url
 * @param {string} forIssue - Is this for an issue?
 * @param {string} project - The project to find
 */
module.exports.getProjectData = async (octokit, projectId) => {
    console.log(eventUrl, project)
    const idResp = await octokit.graphql(this.projectQuery(), projectId);
    return idResp;
}

/**
 * GraphQl query to get project and column information
 *
 * @param {string} projectId - The project to find
 */
 module.exports.projectQuery = (projectId) =>
 `  query{
    node(id: $projectId}) {
      ... on ProjectV2 {
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
            }
            ... on ProjectV2IterationField {
              id
              name
              configuration {
                iterations {
                  startDate
                  id
                }
              }
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
      }
    }`;
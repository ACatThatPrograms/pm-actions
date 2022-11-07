/**
 * Run the GraphQl query to get project and column information
 *
 * @param {octokit} octokit - Octokit instance
 * @param {string} url - Issue or Pull request url
 * @param {string} forIssue - Is this for an issue?
 * @param {string} project - The project to find
 */
module.exports.getProjectData = async (octokit, eventUrl, project) => {
    console.log(eventUrl, project)
    const idResp = await octokit.graphql(this.projectQuery(eventUrl, project));
    return idResp;
}

/**
 * GraphQl query to get project and column information
 *
 * @param {string} url - Issue or Pull request url
 * @param {string} forIssue - Is this for an issue?
 * @param {string} project - The project to find
 */
 module.exports.projectQuery = (eventUrl, project) =>
 `query {
     resource( url: "${eventUrl}" ) {
         ... on ${eventUrl.indexOf("issues") !== -1 ? 'Issue' : 'PullRequest'} {
             projectCards {
                 nodes {
                     id
                     isArchived
                     project {
                         name
                         id
                     }
                 }
             }
             repository {
                 projects( first: 10, states: [OPEN] ) {
                     nodes {
                         name
                         id
                         columns( first: 100 ) {
                             nodes {
                                 id
                                 name
                             }
                         }
                     }
                 }
                 owner {
                     ... on ProjectOwner {
                         projects( search: "${project}", first: 10, states: [OPEN] ) {
                             nodes {
                                 name
                                 id
                                 columns( first: 100 ) {
                                     nodes {
                                         id
                                         name
                                     }
                                 }
                             }
                         }
                     }
                 }
             }
         }
     }
 }`;
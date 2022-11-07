const core = require("@actions/core");
const github = require("@actions/github");
const { default: axios } = require("axios");
const { getProjectData } = require('./queries/projectQuery');

// Github URL pieces
const urlParse =
  /^(?:https:\/\/)?github\.com\/(?<ownerType>orgs|users)\/(?<ownerName>[^/]+)\/projects\/(?<projectNumber>\d+)/;
(async () => {
    try {
        /**
         * @property { String } projectName - Name of the project
         * @property { String } newColumnName - Name of the column for new issues
         * @property { String } assignColumnName - Name of the column for assigned issues
         * @property { String } reviewColumnName - Name of the column for PR'd issues
         * @property { String } closedColumnName - Name of the column for closed issues
         * @property { String } actionPayload - The github action payload
         */
        const actionConfig = {
            projectName: core.getInput("project_name"),
            projectUrl: core.getInput("project_url"),
            newColumnName: core.getInput("new_column_name"),
            assignColumnName: core.getInput("assign_column_name"),
            reviewColumnName: core.getInput("review_column_name"),
            closedColumnName: core.getInput("closed_column_name"),
            repoToken: core.getInput("repo_token"),
            // Not supplied by user's action
            eventUrl: github.context.payload?.issue?.html_url || github.context.payload?.pull_request.html_url,
            ownerTypeQuery: null,
            projectData: null,
            projectOwnerName: null,
            projectNumber: null,
            projectId: null,
            contentId: null,
            actionPayload: github.context.payload,
        };

        // Setup octokit
        actionConfig.octokit = github.getOctokit(actionConfig.repoToken);

        // Backfill projectData
        actionConfig.projectData = await getProjectData(actionConfig.octokit, actionConfig.eventUrl, );
        console.log(actionConfig.projectData);

        // Relay action config to use
        core.notice("Checking event status...");
        core.notice(`Using project_name: ${actionConfig.projectName}`);
        core.notice(`Using new_column_name: ${actionConfig.newColumnName}`);
        core.notice(`Using assign_column_name Name: ${actionConfig.assignColumnName}`);
        core.notice(`Using review_column_name: ${actionConfig.reviewColumnName}`);
        core.notice(`Using closed_column_name: ${actionConfig.closedColumnName}`);
        core.notice(`Repo token found?: ${actionConfig.repoToken !== "empty"}`);
        // core.notice(`Event Payload: ${JSON.stringify(actionConfig.actionPayload, false, 2)}`);

        const urlMatch = actionConfig.projectUrl.match(urlParse);
        if (!urlMatch) {
            throw new Error(
              `Invalid project URL: ${projectUrl}. Project URL should match the format https://github.com/<orgs-or-users>/<ownerName>/projects/<projectNumber>`
            )
        }

        // Fillout additional config object
        actionConfig.ownerTypeQuery = getOwnerTypeQuery(urlMatch.groups?.ownerType);
        actionConfig.projectOwnerName = urlMatch.groups?.ownerName;
        actionConfig.projectNumber = parseInt(urlMatch.groups?.projectNumber ?? '', 10);

        if (!actionConfig.ownerTypeQuery || !actionConfig.projectOwnerName || !actionConfig.projectNumber) {
            throw new Error('Unable to extract project details from provided project url. Verify the URL is correct.')
        }

        const projectOwnerName = actionConfig.projectOwnerName;
        const projectNumber = actionConfig.projectNumber;
        // First, use the GraphQL API to request the project's node ID.
        const idResp = await actionConfig.octokit.graphql(
            `query getProject($projectOwnerName: String!, $projectNumber: Int!) {
            ${actionConfig.ownerTypeQuery}(login: $projectOwnerName) {
                projectV2(number: $projectNumber) {
                        id
                    }
                }
            }`,
            {
                projectOwnerName,
                projectNumber
            }
        )

        const projectId = idResp[actionConfig.ownerTypeQuery]?.projectV2.id;
        // const contentId = issue?.node_id;

        // Backfill content object
        actionConfig.projectId = projectId;
        // actionConfig.contentId = contentId;

        // Choose and enact on task
        if (!!actionConfig.actionPayload.issue) {
            switch (actionConfig.actionPayload.action) {
                case "opened": await issueOpened(actionConfig); break
                case "reopened": await issueReOpened(actionConfig); break;
                case "closed": await issueClosed(actionConfig); break;
            }
        }

    } catch (ex) {
        core.setFailed(ex.message);
    }
})();


async function issueOpened(actionConfig) {
    await actionConfig.octokit.query(``)
    console.log("ISSUE OPENED");
}
async function issueReOpened(actionConfig) {
    console.log("ISSUE RE-OPENED");
}
async function issueClosed(actionConfig) {
    console.log("ISSUE CLOSED");
}

async function graphqlReq (actionConfig) {
    https://api.github.com/graphql
    axios.post("https://api.github.com/graphql");

}

function getOwnerTypeQuery(ownerType) {
    const ownerTypeQuery = ownerType === 'orgs' ? 'organization' : ownerType === 'users' ? 'user' : null;
    if (!ownerTypeQuery) {
      throw new Error(`Unsupported ownerType: ${ownerType}. Must be one of 'orgs' or 'users'`)
    }
    return ownerTypeQuery
}
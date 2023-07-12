import { read } from "../utils/files.js";

const users = JSON.parse(await read("./src/utils/userData.json"))

function jiraHeaders() {
  return {
    Authorization: `${process.env.JIRA_TOKEN}`,
    Accept: `application/json`,
  };
}
async function getIssueByUser(user) {
  try {
    console.log("getIssueByUser...");
    var requestOptions = {
      method: "GET",
      headers: jiraHeaders(),
    };
    const response = await fetch(
      `${process.env.JIRA_URL}/rest/api/2/search?jql=assignee in (${user}) AND status != Cancel AND status != Closed AND status != Resolved AND status != Cancelled AND status != Done AND status != RELEASED`,
      requestOptions
    );
    const query = await response.json();
    console.log("getIssueByUser code:", response.status);
    return query;
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

async function getAllIssue() {
  try {
    console.log("getAllIssue...");
    var issues = [];
    for (let index = 0; index < users.length; index++) {
      var userData = {
        user: users[index].email,
        issues: [],
      };

      console.log("user", users[index].email.split("@")[0]);
      var user = users[index].email.split("@")[0];
      const issuesByUser = await getIssueByUser(user);
      if (issuesByUser.error) {
        return {
          error: issues.error,
        };
      }

      if (issuesByUser.total > 0) {
        for (let index = 0; index < issuesByUser.issues.length; index++) {
          var issue = {
            id: issuesByUser.issues[index].id,
            key: issuesByUser.issues[index].key,
            status: issuesByUser.issues[index].fields.status.name,
            created_at: issuesByUser.issues[index].fields.created,
            updated_at: issuesByUser.issues[index].fields.updated,
            priority: issuesByUser.issues[index].fields.priority ? issuesByUser.issues[index].fields.priority.name : "",
            labels: issuesByUser.issues[index].fields.labels,
            subtasks: issuesByUser.issues[index].fields.subtasks,
            isParent: issuesByUser.issues[index].fields.parent ? false : true,
          };
          userData.issues.push(issue);
        }
      }
      console.log("issuesCont", issuesByUser.issues.length);
      issues.push(userData);
    }

    return issues;
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

export { getIssueByUser, getAllIssue };

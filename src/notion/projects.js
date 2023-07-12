import { read, write } from "../utils/files.js";

import { projectPage } from "./templates.js";

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN_INTEGRATION}`,
    "Notion-Version": `${process.env.NOTION_VERSION}`,
  };
}

const projects = JSON.parse(await read("./src/utils/projectData.json"))

async function postProject(projectkey) {
    try {
      // rellenar page
      console.log("postProject...");

      console.log("projectkey", projectkey)

      
      var pageTemplate = JSON.parse(JSON.stringify(projectPage));
      pageTemplate.parent.database_id = process.env.NOTION_PROJECT_DB;
      pageTemplate.properties.title.title[0].text.content = projectkey;

      var headers = notionHeaders();
      headers["Content-Type"] = "application/json";
      var requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(pageTemplate),
      };
  
      const response = await fetch(
        `${process.env.NOTION_URL}/pages`,
        requestOptions
      );
      const query = await response.json();
      console.log("projectkey code:", response.status);
      if (response.status != 200 && response.status != 201)
        console.log("query", query);
      
    //   const data = await response.json();
      return query.id.replaceAll("-", "")
      // return query;
    } catch (error) {
      console.log("error", error);
      return {
        error: error,
      };
    }
  }

async function getProjectIdByKey(key) {
    key = key.toUpperCase().split("-")[0];
    for (let index = 0; index < projects.length; index++) {
        if (projects[index].name == key) {
            return projects[index].id;
        }
    }
    console.log(`${key} Not Found, proceed to create.`)
    const projectId = await postProject(key)

    let temp = projects
        temp.push({
            "id": projectId,
            "name": key,
            "type": "JIRA"
        },)
    await write("./src/utils/projectData.json", JSON.stringify(temp))

    return projectId
}
async function getProjectByKey(key) {
    key = key.toUpperCase().split("-")[0];
    // console.log("key", key)
    // console.log(projects)
    for (let index = 0; index < projects.length; index++) {
        // console.log("projects[index].name", projects[index].name)
        if (projects[index].name == key) {
            return projects[index];
        }
    }
}

export { getProjectIdByKey, getProjectByKey }
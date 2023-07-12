import { Client } from "@notionhq/client"

import { page, tagsCreator } from "./templates.js";
import { getProjectIdByKey, getProjectByKey } from "./projects.js";

import { read } from "../utils/files.js";

const users = JSON.parse(await read("./src/utils/userData.json"))

// Initializing a client
function notion(){
  return new Client({
    auth: `${process.env.NOTION_TOKEN_INTEGRATION}`,
  })
}
function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN_INTEGRATION}`,
    "Notion-Version": `${process.env.NOTION_VERSION}`,
  };
}


async function isTeamUser(userEmail) {
  try {
    // console.log("isTeamUser...", userEmail);
    const isUser = users.find((u) => {
      return u.team === process.env.DEFAULT_TEAM && u.email === userEmail;
    });
    return isUser && isUser.email ? true : false;
  } catch (error) {
    console.log(error);
    return {
      error: error,
    };
  }
}

async function getUsers() {
  try {
    console.log("getUsers...");
    var requestOptions = {
      method: "GET",
      headers: notionHeaders(),
    };

    const response = await fetch(
      `${process.env.NOTION_URL}/users`,
      requestOptions
    );
    const users = await response.json();
    console.log("getUsers code:", response.status);
    return users;
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

async function getTeamUsers() {
  try {
    console.log("getTeamUsers...");
    const users = await getUsers();
    if (users.error) {
      return users;
    }

    // console.log(users)
    const teamUsers = [];
    for (let i = 0; i < users.results.length; i++) {
      const user = users.results[i];
      if (
        user.type === "person" &&
        user.person.email &&
        user.person.email.includes(process.env.TEAM_EMAIL) &&
        (await isTeamUser(user.person.email))
      ) {
        teamUsers.push(user);
      }
    }

    // console.log("teamUsers", teamUsers);

    return teamUsers;
  } catch (error) {
    console.log("getteamUsers error", error);
    return {
      error: error,
    };
  }
}

async function getTasksColumn() {
  try {
    console.log("getTasksColumn...");
    var headers = notionHeaders();
    headers.ContentType = "application/json";
    var requestOptions = {
      method: "POST",
      headers: notionHeaders(),
    };

    const response = await fetch(
      `${process.env.NOTION_URL}/databases/${process.env.NOTION_PEOPLE_TASKS_DB}/query`,
      requestOptions
    );
    const query = await response.json();
    console.log("getTasksColumn code:", response.status);

    return query;
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

async function getPageById(pageId) {
  try {
    console.log("getPageById...");
    var headers = notionHeaders();
    headers.ContentType = "application/json";
    var requestOptions = {
      method: "GET",
      headers: notionHeaders(),
    };

    const response = await fetch(
      `${process.env.NOTION_URL}/pages/${pageId}`,
      requestOptions
    );
    const query = await response.json();
    console.log("getPageById code:", response.status);
    const pageData = {
      id: query.id,
      name: query.properties["Task name"]?.title[0]?.plain_text,
      Assignee: {
        id: query.properties["Assignee"]?.people[0]?.id,
        name: query.properties["Assignee"]?.people[0]?.name,
        email: query.properties["Assignee"]?.people[0]?.person?.email,
      },
      Status: query.properties["Status"]?.status?.name,
      Due: query.properties["Due"]?.date.start,
      Project: query.properties["Project"]?.relation[0]?.id,
      Link: query.properties["Link"]?.rich_text[0]?.text.content,
      Priority: query.properties["Priority"]?.select.name,
      Tags: query.properties["Tags"]?.multi_select.map((tag) => {
        return tag.name;
      }),
    };
    // console.log("pageData:", pageData)
    return pageData;
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

async function getPageByTitle(key) {
  try {
    console.log("getPageByTitle...");
    
      const myPage = await notion().databases.query({
        database_id: process.env.NOTION_PEOPLE_TASKS_DB,
        filter: {
          property: "Task name",
          title: {
            equals: key
          }
        },
      })
    return myPage;
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

async function tasksData() {
  try {
    console.log("tasksData...");
    const tasks = await getTasksColumn();
    if (tasks.error) {
      return tasks;
    }

    for (let i = 0; i < tasks.results.length; i++) {
      console.log("-------------------");
      console.log(`TASK ${i + 1} of ${tasks.results.length}`);
      const page = await getPageById(tasks.results[i].id);
      console.log("page", page);
    }
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

async function postTask(task, userId) {
  try {
    // rellenar page
    console.log("postTask...");
    // console.log("task", JSON.stringify(task))
    // console.log("userId", userId)
    var pageTemplate = await createTemplate(task, userId)
    // console.log(`${process.env.NOTION_URL}/pages`);
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
    console.log("postTask code:", response.status);
    if (response.status != 200 && response.status != 201)
      console.log("query", query);

    // return query;
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

async function archivePage(pageId) {
  try {
    console.log("archivePage...");
    console.log("pageId", pageId);
    var headers = notionHeaders();
    headers["Content-Type"] = "application/json";
    var requestOptions = {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({
        archived: true,
      }),
    };

    const response = await fetch(
      `${process.env.NOTION_URL}/pages/${pageId}`,
      requestOptions
    );
    const query = await response.json();
    console.log("archivePage code:", response.status);
    if (response.status != 200 && response.status != 201)
      console.log("query", query);
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

async function updateValidation(task, project, userId) {
  try {
    // rellenar page
    console.log("updateValidation...");
    var ToBeUpdate = false
    var pageProperties = {}
    const pageResult = await getPageByTitle(task.key);
    
    if (pageResult.results.length == 0) {
      return {
        error: "Task not found",
      };
    }

    if (pageResult.results.length > 1) {
      return {
        error: "Many task return in the query.",
      };
    }
    const notionPage = pageResult.results[0]
    var pageTemplate = await createTemplate(task, userId)    
    // compare between task and pageTemplate to validate if necesary update page in notion
    // console.log("pageTemplate", JSON.stringify(pageTemplate))

    if(pageTemplate.properties.title.title[0].text.content != notionPage.properties["Task name"].title[0].text.content){
      console.log("Diferente: title")
      ToBeUpdate = true
      pageProperties.title = {
        title: [
          {
            text: {
              content: pageTemplate.properties.title.title[0].text.content
            }
          }
        ]
      }
    }

    if(pageTemplate.properties.Assignee.people[0].id != notionPage.properties.Assignee.people[0].id){
      console.log("Diferente: Assignee")
      ToBeUpdate = true
      pageProperties.Assignee = {
        people: [ 
          {
            id: pageTemplate.properties.Assignee.people[0].id
          }
        ]
      }
    }
    if(pageTemplate.properties.Status.status.name.toLowerCase() != notionPage.properties.Status.status.name.toLowerCase()){
      console.log("Diferente: Status")
      ToBeUpdate = true
      pageProperties.Status = {
        status: {
          name: pageTemplate.properties.Status.status.name
        }
      }
    }
    if(pageTemplate.properties.Updated_at.date.start != new Date(notionPage.properties.Updated_at.date.start).toISOString().slice(0, 10)){
      console.log("Diferente: Updated_at")
      ToBeUpdate = true
      pageProperties.Updated_at = {
        date: {
          start: new Date(pageTemplate.properties.Updated_at.date.start).toISOString().slice(0, 10)
        }
      }
    }
    if(pageTemplate.properties.Priority.select.name != notionPage.properties.Priority.select.name){
      console.log("Diferente: Priority")
      ToBeUpdate = true
      pageProperties.Priority = {
        select: {
          name: pageTemplate.properties.Priority.select.name
        }
      }
    }
    
    if(pageTemplate.properties.isParent.select.name != notionPage.properties.isParent.select.name){
      console.log("Diferente: isParent")
      ToBeUpdate = true
      pageProperties.isParent = {
        select: {
          name: pageTemplate.properties.isParent.select.name
        }
      }
    }

    // tags siempre habrá diferencias ya que notion maneja mas atributos, entonces, se validará cada milti_select[*].name contra notionpage
    var isTagsDiferent = false
    pageTemplate.properties.Tags.multi_select.forEach(tag => {
      // si existe una sola diferencia se añadirá todo el elemento
      const notionTag = notionPage.properties.Tags.multi_select.find((t) => {
        return t.name = tag.name
      });
      if(!notionTag) isTagsDiferent = true
    });
    if(!isTagsDiferent){
      // si no existe diferencias de jira a notion se valida notion a jira
      notionPage.properties.Tags.multi_select.forEach(tag => {
        // si existe una sola diferencia se añadirá todo el elemento
        const pageTag = pageTemplate.properties.Tags.multi_select.find((t) => {
          return t.name = tag.name
        });
        if(!pageTag) isTagsDiferent = true
      });
    }


    if(isTagsDiferent){
      console.log("Diferente: Tags")
      ToBeUpdate = true
      pageProperties.Tags = {}
      pageProperties.Tags.multi_select= pageTemplate.properties.Tags.multi_select
    }
    // console.log("pageProperties", JSON.stringify(pageProperties))
    if(!ToBeUpdate){
      
      console.log(`${task.key} OK, no update require`)
      return true
      
    }
    console.log(`${task.key} ToBeUpdate, update require`)
    await updateTask(pageProperties, notionPage.id)
    // return query;
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

async function updateTask(pageProperties, pageId) {
  try {
    // rellenar page
    console.log("updateTask...");
    console.log(JSON.stringify(pageProperties))
    var headers = notionHeaders();
    headers["Content-Type"] = "application/json";
    var requestOptions = {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({
        "properties": pageProperties
      }),
    };

    const response = await fetch(
      `${process.env.NOTION_URL}/pages/${pageId}`,
      requestOptions
    );
    const query = await response.json();
    console.log("updateValidation code:", response.status);
    if (response.status != 200 && response.status != 201)
      console.log("query", query);
    // return query;
  } catch (error) {
    console.log("error", error);
    return {
      error: error,
    };
  }
}

async function createTemplate(task, userId){
    var pageTemplate = JSON.parse(JSON.stringify(page)); //NO quiero que copie la referencia, por eso uso JSON.parse(JSON.stringify(page))
    console.log("taskKey", task.key);
    // console.log("isParent", task.isParent)
    pageTemplate.parent.database_id = process.env.NOTION_PEOPLE_TASKS_DB;
    pageTemplate.properties.title.title[0].text.content = task.key;
    pageTemplate.properties.Assignee.people[0].id = userId;
    pageTemplate.properties.Status.status.name = task.status;
    pageTemplate.properties.Created_at.date.start = new Date(task.created_at)
      .toISOString()
      .slice(0, 10);
    pageTemplate.properties.Updated_at.date.start = new Date(task.updated_at)
      .toISOString()
      .slice(0, 10);
    pageTemplate.properties.Project.relation[0].id = await getProjectIdByKey(
      task.key
    );
    pageTemplate.properties.Link.rich_text[0].text.content = `${process.env.JIRA_URL}/browse/${task.key}`;
    pageTemplate.properties.Link.rich_text[0].text.link.url = `${process.env.JIRA_URL}/browse/${task.key}`;
    pageTemplate.properties.Priority.select.name = task.priority != "" ? task.priority : "NO-PRIORITY";
    pageTemplate.properties.Tags.multi_select = tagsCreator(task.labels);
    pageTemplate.properties.isParent.select.name = task.isParent.toString();

    return pageTemplate
}

export {
  getUsers,
  getTeamUsers,
  getTasksColumn,
  getPageById,
  tasksData,
  postTask,
  archivePage,
  updateValidation,
};

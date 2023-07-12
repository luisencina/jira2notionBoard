import * as dotenv from "dotenv";
import {
  getTeamUsers,
  getTasksColumn,
  getPageById,
  tasksData,
  postTask,
  archivePage,
  updateValidation,
  getUsers,
} from "./src/notion/index.js";
import { getIssueByUser, getAllIssue } from "./src/jira/index.js";
import {  getProjectByKey } from "./src/notion/projects.js";

// import { users } from "./src/utils/users.js";
import { read, write } from "./src/utils/files.js";

dotenv.config();

const MINUTE_SLEEP = process.env.MINUTE_SLEEP;
const TIME_SLEEP = MINUTE_SLEEP * 60 * 1000; // 10 minutes


TODO();

async function TODO() {

  
  while (true) {


    
    try {
      console.group("Prepare data")
  
    // preparing new data
  
    const userData = JSON.parse(await read("./src/utils/userData.json"))
  
    // console.log(usersData)
      // search new users
    console.log("getNotionUsers...");
    const notionUsers = await getUsers();
    if (notionUsers.error) {
      return notionUsers;
    }
    // console.log("notionUsers", notionUsers)
    

    const notionPersons = notionUsers.results.filter((user) => {
      // console.log(user)
      return user.object == "user" && 
      user.type == "person" && 
      user.person.email &&
      user.person.email.includes(process.env.TEAM_EMAIL)
    })
    // console.log("notionPersons", notionPersons)
    notionPersons.forEach(async user => {
      // console.log(user.name)
      const obj = userData.find((u) => {
        return u.email === user.person.email;
      });
      if(!obj){
        console.log("===NEW USER===")
        console.log("email: ", user.person.email)
        let temp = userData
        temp.push({
          "team": process.env.DEFAULT_TEAM,
          "name": user.name,
          "email": user.person.email,
      })
        await write("./src/utils/userData.json", JSON.stringify(temp))
      }
      
    });

    console.groupEnd("Prepare data")


  }catch(error){
    console.log("prepare new data error", error);
  }

    // sync jira issues with notion tasks

    // get all users from notion
    console.log("--------getTeamUsers--------");
    const users = await getTeamUsers();

    // console.log("users", users);

    // get all tasks from notion
    console.log("--------getTasksColumn--------");
    const tasks = await getTasksColumn();

    // console.log("tasks", tasks);

    // get all issues from jira
    console.log("--------getAllIssue--------");
    const jiraIssues = await getAllIssue();

    // console.log("jiraIssues", jiraIssues);

    // verify if issue exist in notion
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      console.log("--------------------");
      console.group("user", user.person.email);
      const tasksByUser = await tasks.results.filter((task) => {
        // console.log("task", JSON.stringify(task));
        return (
          task.properties &&
          task.properties.Assignee.people.length > 0 &&
          task.properties.Assignee.people[0].person.email === user.person.email
        );
      });

      // console.log("tasksByUser", tasksByUser);
      const toCreate = [];
      const toUpdate = [];
      const toDelete = [];

      const userIssues = await jiraIssues.find((jiraIssue) => {
        return jiraIssue.user === user.person.email;
      });

      await userIssues.issues.forEach((issue) => {
        const task = tasksByUser.filter((task) => {
          return (
            task.properties["Task name"].title[0].text.content === issue.key
          );
        });
        if (task.length === 0) {
          toCreate.push(issue);
        }
      });

      await tasksByUser.forEach((task) => {
        // console.log("task", task.properties["Task name"].title[0].text.content)
        const issue = userIssues.issues.find((issue) => {
          // console.log("issue", issue.key)
          return (
            issue.key === task.properties["Task name"].title[0].text.content
          );
        });
        if (issue) {
          if (task.properties["Task name"].title[0].text.content == issue.key) {
            toUpdate.push(issue);
          }
        } else {
          toDelete.push(task);
        }
      });

      const userId = user.id;
      // console.log("toCreate", toCreate);

      // create tasks in notion
      console.log("=======================")
      console.log(`Tasks to create: ${toCreate.length}`)
      console.log("=======================")

      for (let index = 0; index < toCreate.length; index++) {
        await postTask(toCreate[index], userId);
      }

      // console.log("toUpdate", toUpdate);
      console.log("=======================")
      console.log(`Tasks to update: ${toUpdate.length}`)
      console.log("=======================")
      for (let index = 0; index < toUpdate.length; index++) {
        const project = await getProjectByKey(toUpdate[index].key);
        if(project && project.type === "JIRA"){
          await updateValidation(toUpdate[index], project, userId);
        }
        
      }

      console.log("=======================")
      console.log(`Tasks to delete: ${toDelete.length}`)
      console.log("=======================")
      // console.log("toDelete", toDelete);
      for (let index = 0; index < toDelete.length; index++) {
        await archivePage(toDelete[index].id);
      }

      console.groupEnd("user", user.person.email);
    }
    console.log("*********************")
    console.log(`We will restart the process in ${MINUTE_SLEEP} minutes.`)
    console.log("*********************")
    await sleep(TIME_SLEEP);

  }
}

// funcion que pausa el programa por 5 minutos
async function sleep(milliseconds) {
  await new Promise((resolve) => {
    return setTimeout(resolve, milliseconds);
  });
}

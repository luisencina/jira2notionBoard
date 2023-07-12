# Jira to Notion Board

This project send your Jira tickets on a Notion Page to organize and see your team tickets.

![board](/img/jira2notion.png)



Template: https://www.notion.so/templates/notion-projects-and-tasks

## what does the project do?

- Get all users registred (only person, not bot) in your Notion Team Space.
- Get all pages from DB Board.
- Get all jira issues of each Notion Team Space user.
- Create/Update/Delete each page that belongs to each user.
- Create automatily each project exists on Jira.
- Repeat these steps every MINUTE_SLEEP.
- Jira messages are NOT loaded on the pages.


## Requirements

- ID Task table.
- ID Project table.
- Create all "Status" that your team use on your Agile methodology.
- Create some new properties (Steps sections...).
- Rename .env_example a .env
- Of course, you need to create and associate an "integration" in your template (Task and Project table).
- Integration Capabilities required:  Read user information including email addresses.

Env variables explain...

Var | Explain | Example | 
--- | --- | --- | 
MINUTE_SLEEP | Minutes to sleep to run again the project | 30 |  
NOTION_TOKEN_INTEGRATION | Notion token | secret_XXXXXX |
NOTION_URL | Notion Api URL | https://api.notion.com/v1 |
NOTION_VERSION | Notion Api version | 2022-06-28 |
NOTION_PEOPLE_TASKS_DB | DB Board ID  | 74v5jd88f444d7a569cc88b |
NOTION_PROJECT_DB | DB Projects ID | 5f8f5ns97764f6ghfchtklss |
TEAM_EMAIL | your team email domain | @team.com.py |
JIRA_URL | your team jira api domain | https://example.com/rest/api/2 |
JIRA_TOKEN | your jira token/basic | Basic ..... |

## Steps

-  Get template: Projects & tasks (by Notion)

![template](/img/template.png)

- Edit the property "Status"

![edit status](/img/status_property.png)

- Create all status that your Team Jira use (Camel Case).

![create status](/img/status_create.png)

- In this example, Jira use 4 status, then you need to create the follow states.

  - Cancel
  - To Do
  - In Progress
  - Done 

![jira status](/img/jiraStatusExample.png)

- Create new properties

Property | Type |  
--- | --- | 
Updated_at | Date |   
Priority | Select |   
Tags | Multi-select |
Link | Text |
isParent | Select (options: true and false) |

- Finally, invite your team.

![invite](/img/invite_user.png)


## Installation Steps


- git clone <https://github.com/luisencina/jira2notionBoard.git>
- cd jira2notionBoard
- npm install
- npm run start



![code running](/img/running.png)


## Darshboard

- By People: you can see task organized by people.
![Notion Dashboard](/img/dashboard.png)

- All Task: All task of your team.
![Notion Dashboard All Task](/img/task_board.png)



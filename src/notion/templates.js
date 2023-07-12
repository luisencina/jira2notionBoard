const page = {
    "parent": {
        "database_id": ""
    },
    "properties": {
        "title": {
            "title": [
                {
                    "text": {
                        "content": ""
                    }
                }
            ]
        },
        "Assignee": {
            "id": "notion%3A%2F%2Ftasks%2Fassign_property",
            "type": "people",
            "people": [
                {
                    "id": ""
                }
            ]
        },
        "Status": {
            "status": {
                "name": ""
            }
        },
        "Created_at": {
            "id": "notion%3A%2F%2Ftasks%2Fdue_date_property",
            "type": "date",
            "date": {
                "start": "2023-04-20",
                "end": null,
                "time_zone": null
            }
        },
        "Created_at": {
            "type": "date",
            "date": {
                "start": "",
                "end": null,
                "time_zone": null
            }
        },
        "Updated_at": {
            "type": "date",
            "date": {
                "start": "",
                "end": null,
                "time_zone": null
            }
        },
        "Project": {
            "type": "relation",
            "relation": [
                {
                    "id": ""
                }
            ],
            "has_more": true
        },
        "Link": {
            "id": "_%3FYU",
            "type": "rich_text",
            "rich_text": [
                {
                    "type": "text",
                    "text": {
                        "content": "",
                        "link": {
                            "url": ""
                        }
                    }
                }
            ]
        },
        "Priority": {
            "id": "notion%3A%2F%2Ftasks%2Fpriority_property",
            "type": "select",
            "select": {
                "name": ""
            }
        },
        "Tags": {
            "id": "notion%3A%2F%2Ftasks%2Ftags_property",
            "type": "multi_select",
            "multi_select": [

            ]
        },
        "isParent": {
            "id": "Ab~b",
            "type": "select",
            "select": {
                "name": ""
            }
        },
    }
}

const projectPage = {
    "icon": {
        "type": "external",
        "external": {
            "url": "https://www.notion.so/icons/target_lightgray.svg"
        }
    },
    "parent": {
        "database_id": ""
    },
    "properties": {
        "title": {
            "title": [
                {
                    "text": {
                        "content": ""
                    }
                }
            ]
        },
        "Status": {
            "id": "notion%3A%2F%2Fprojects%2Fstatus_property",
            "type": "status",
            "status": {
                "name": "Planning"
            }
        }
    }
}

function tagsCreator(tags) {
    let tagsArray = [];
    tags.forEach(tag => {
        tagsArray.push({
            "name": tag
        })
    });
    return tagsArray;
}

export { page, projectPage, tagsCreator };
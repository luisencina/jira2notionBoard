import { read } from "./files.js";

async function readUserData(){
    return await read("./src/utils/userData.json")
}

const users = readUserData()

export { users };
// const fs = require('fs').promises;
// const fsCore = require('fs');
import { promises as fs } from 'fs';



// async function checkDirectory(path) {
//     try {
//         return fsCore.statSync(path);
//     } catch (ex) { 
//         console.error("checkDirectory-NotFound",)
//     }
// }

// async function createDirectory(path) {
//     try {
//         console.log("creating", path)
//         fsCore.mkdirSync((path));
//         return "ok"
//     } catch (ex) { 
//         console.error("createDirectoryFs-",ex)
//     }
// }

// async function listDirectory(path) {
//     try {
//         return fsCore.readdirSync(path)
//     } catch (ex) { 
//         console.error("listDirectory-",ex)
//     }
// }

async function write(path, content){
    try{
        await fs.writeFile(path, content)
        // await fs.writeFile('test.txt', 'hello');
    }catch(err){
        console.error("writeFs-",err)
    }
}

async function read(path){
    try{
        const data = await fs.readFile(path)
        return data.toString()
    }catch(err){
        console.error(err)
    }
}


export { read, write };
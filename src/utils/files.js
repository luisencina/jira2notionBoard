import { promises as fs } from 'fs';

async function write(path, content){
    try{
        await fs.writeFile(path, content)
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
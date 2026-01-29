import { ConnectDb } from "./db/db.js";
import dotenv from 'dotenv';
import app from './app.js';
import { createDefaultadmin } from "./controllers/user.controller.js";

dotenv.config({
    path: './.env'
})
const PORT=process.env.PORT || 2000;
ConnectDb()
.then(()=>{
    const serve=app.listen(PORT, async ()=>{
        await createDefaultadmin()
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch((error)=>{
    console.error("Error while connecting to database",error.message);
    process.exit(1);
})
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';   


 const app = express();

 app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential:true
 }));

 app.use(express.json({limit:"10kb"}))
 app.use(express.urlencoded({limit:"10kb"}))
 app.use(express.static("public"))
 app.use(cookieParser())

 //User-Route
 import userRouter from "./routes/user.routes.js";
 app.use("/api/v1/User", userRouter)

 //Project-route
 import { Projectrouter } from './routes/project.route.js';
 app.use("/api/v1/Project",Projectrouter)

 export default app


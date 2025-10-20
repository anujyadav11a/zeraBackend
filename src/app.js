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

 import userRouter from "./routes/user.routes.js";
 app.use("/api/v1/User", userRouter)

 export default app


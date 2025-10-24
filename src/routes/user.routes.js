import { Router } from "express";
import {
    userRegister,
    userLogin,
    userLogout
} from "../controllers/user.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js";

const userRouter = Router();
userRouter.route("/register").post(userRegister)
userRouter.route("/login").post(userLogin)
userRouter.route("/Logout").post(verifyToken, userLogout)

export default userRouter;

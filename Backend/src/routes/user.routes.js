import { Router } from "express";
import {
    userRegister,
    userLogin,
    userLogout,
    changeCurrentPassword,
    refreshAccessToken
} from "../controllers/user.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js";
import { authLimiter, passwordChangeLimiter } from "../middleware/rateLimiter.middleware.js";

const userRouter = Router();
userRouter.route("/register").post(authLimiter, userRegister)
userRouter.route("/login").post(authLimiter, userLogin)
userRouter.route("/Logout").post(verifyToken, userLogout)
userRouter.route("/changePassword").post(passwordChangeLimiter, verifyToken, changeCurrentPassword)

export default userRouter;

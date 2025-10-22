import { ApiError } from "../utils/apierror";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";


const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const Token=req.cookies?.accessToken || req.headers
        ("authorization")?.replace("Bearer ","");
    
        if(!Token){
            throw new ApiError(401,"unauthorized access,no token provided")
        }
        const decodedToken=jwt.verify(Token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"unauthorized access,invalid token")
        }
        req.user=user
        next()
    
    } catch (error) {
      throw new ApiError(401,error?.message ||"unauthorized access,invalid token")
    }
})

export {verifyToken}
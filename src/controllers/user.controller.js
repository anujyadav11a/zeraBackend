import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";  
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import bcrypt from "bcrypt"

const createDefaultadmin=asyncHandler(async(req,res)=>{

    const existingAdmin=User.findOne({role:admin})
    if(!existingAdmin){
       const hasPassword= await bcrypt.hash("admin@123",10)

       await User.create({
        username:"admin12",
        password:hasPassword,
        email:"admin@gmail.com",
        name:"Admin",
        role:"admin"

       })
    }
    else{
        throw new ApiResponse(200,"admin already exist")
    }
})

const userRegister= asyncHandler(async (req,res)=>{
    const {username,name,email,password}=req.body

    if([username,name,email,password].some((field)=> field?.trim()==="")){
        throw new ApiError(400,"all fields are required")
    }

    const userExist=await User.findOne({
        $or:[{username},{email}]
    })
    if(userExist){
        throw new ApiError(409,"user already exist with this email or username")
    }

    const user= await new User.create({
        username,
        name,
        email,
        password
    })

    const crestedUser= await User.findById(user._id)
    .select("-password")

    if(!crestedUser){
        throw new ApiError(500,"user registration failed, please try again")
    } 

    return res.status(201)
    .json(new ApiResponse(201,crestedUser,"user registered successfully"))
})


export {userRegister, createDefaultadmin}
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";  
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import bcrypt from "bcrypt"

const generateAccessandRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        if(!user){
            throw new ApiError(404,"user not found")
        }
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"internal server error")
    }
}

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

const userLogin=asyncHandler(async(req,res)=>{
    const {email,password}=req.body

    if(!email || !password){
        throw new ApiError(400,"email and password are required")
    }
    const user=await User.findOne({email})
    if(!user){
        throw new ApiError(404,"user not found")
    }
    const isPasswordvalid=await user.comparePassword(password)
    if(!isPasswordvalid){
        throw new ApiError(401,"invalid credentials")
    }

    const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id)

    const LoggedinUser= await User.findById(user._id).select("-password -refreshToken")

   const Option={
    httpOnly:true,
    secure :true
    }
    return res.status(200)
    .cookie("refreshToken",refreshToken,Option)
    .cookie("accessToken",accessToken,Option)
    .json(
        new ApiResponse(200,LoggedinUser,"user logged in successfully")
    )
})

const userLogout=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }


    )

    const Option={
        httpOnly:true,
        ssecure:true
    }

    return res.status(200)
    .clearCookie("refreshToken",Option)
    .clearCookie("accessToken",Option)
    .json(
        new ApiResponse(200,"user logged out successfully")
    )
})

    

export {userRegister,
     createDefaultadmin,
     userLogin

    }
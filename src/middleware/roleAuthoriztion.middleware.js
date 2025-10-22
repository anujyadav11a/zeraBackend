import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apierror";

const roleAuthorization=(allowedRoles)=>{
    return asyncHandler(async(req ,res, next)=>{

        if(!req.user){
            throw new ApiError(401,"unauthorized access,no user information found")
        }
        const {role}=req.user
        if(!allowedRoles.includes(role)){
            throw new ApiError(403,"forbidden access,you don't have permission to access this resource")
        }
        next()
    })
}
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.models.js";
import mongoose from "mongoose";

const validateProjectId = asyncHandler(async (req , res , next)=>{
    let {projectId}=req.params;
   


    if (!projectId || String(projectId).trim() === '') {
        throw new ApiError(400, ' projectId is required');
    }
     projectId=projectId.trim()
    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new ApiError(400,"invalid project Id")
    }
    const project = await Project.findById(projectId).select('_id').lean();
  if (!project) {
    throw new ApiError(404, 'project not found');
  }
  
  req.project = project;

    next();
})

export {validateProjectId}
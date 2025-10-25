import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { Project } from "../models/project.models.js";


const projectHeadAuthorization = asyncHandler(async (req, res, next) => {
  
  const projectId =
    req.body?.projectId || req.body?.ProjectId || req.params?.projectId || req.query?.projectId;
 
  
  if (!projectId || (typeof projectId === "string" && projectId.trim() === "")) {
    throw new ApiError(400, "projectId is required");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "project not found");
  }

  
  if (req.user && req.user.role === "admin") {
    req.project = project;
    return next();
  }

  
  const projectHeadId = project.createdBy && project.createdBy.toString
    ? project.createdBy.toString()
    : String(project.projectHead);
  const userId = req.user && req.user._id && req.user._id.toString ? req.user._id.toString() : String(req.user?._id);


  if (projectHeadId !== userId) {
    throw new ApiError(403, "Access denied. Only project head can perform this action.");
  }

  req.project = project;
  next();
});

export { projectHeadAuthorization };
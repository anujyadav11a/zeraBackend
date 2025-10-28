import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError} from "../utils/apierror.js"
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js";

 const projectMemberAuthorization = asyncHandler(async (req, res, next) => {
  // Accept projectId provided in params, body, query, or from previously validated req.project
  const projectId = req.params?.projectId || req.body?.projectId || req.query?.projectId || (req.project && String(req.project._id)) || req.projectId;

  if (!projectId || (typeof projectId === "string" && projectId.trim() === "")) {
    throw new ApiError(400, "projectId is required");
  }

  
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }


  const member = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id
  });

  if (!member) {
    throw new ApiError(403, "Access denied. You are not a member of this project.");
  }

  
  req.project = project;
  next();
});

export {projectMemberAuthorization}
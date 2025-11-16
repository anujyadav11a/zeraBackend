import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { ROLES } from "../constants/roles.js";


const projectHeadAuthorization = asyncHandler(async (req, res, next) => {
  
  const projectId =
    req.body?.projectId || req.body?.ProjectId || req.params?.projectId || req.query?.projectId;
  console.log("projectid",projectId)
  
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

  
  // Prefer using createdBy ObjectId; call toString() correctly.
  const projectHeadId = project && project.createdBy
    ? (typeof project.createdBy.toString === 'function' ? project.createdBy.toString() : String(project.createdBy))
    : String(project.projectHead);
  const userId = req.user && req.user._id && req.user._id.toString ? req.user._id.toString() : String(req.user?._id);


  // Allow creator
  if (projectHeadId === userId) {
    req.project = project;
    req.projectId = projectId;
    return next();
  }

  // Allow global admin
  if (req.user && req.user.role === ROLES.ADMIN) {
    req.project = project;
    req.projectId = projectId;
    return next();
  }

  // Fallback: check ProjectMember role 'leader' (if creator isn't the caller)
  const leaderMember = await ProjectMember.findOne({ project: projectId, user: req.user._id, role: ROLES.LEADER });
  if (leaderMember) {
    req.project = project;
    req.projectId = projectId;
    return next();
  }

  throw new ApiError(403, "Access denied. Only project head can perform this action.");

  req.project = project;
 req.projectId = projectId;
  next();
});

export { projectHeadAuthorization };
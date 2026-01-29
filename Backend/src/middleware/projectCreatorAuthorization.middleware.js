import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { ROLES } from "../constants/roles.js";


const projectCreatorAuthorization = asyncHandler(async (req, res, next) => {
  const projectId =
    req.body?.projectId || req.body?.ProjectId || req.params?.projectId || req.query?.projectId || req.projectId;

  if (!projectId || (typeof projectId === "string" && projectId.trim() === "")) {
    throw new ApiError(400, "projectId is required");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "project not found");
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

  throw new ApiError(403, "Access denied. Only project creator/leader/admin can perform this action.");
});

export { projectCreatorAuthorization };

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { ROLES } from "../constants/roles.js";

// Allows access only to project leader (ProjectMember.role === 'leader') or global admin (req.user.role === 'admin')
const projectLeaderAuthorization = asyncHandler(async (req, res, next) => {
  // Accept either projectId or memberId (memberId -> fetches project from member)
  const memberId = req.params?.memberId || req.body?.memberId;
  const projectIdFromReq = req.params?.projectId || req.body?.projectId || req.query?.projectId || req.projectId;

  let projectId = projectIdFromReq;

  if (!projectId && memberId) {
    const targetMember = await ProjectMember.findById(memberId).select('project user role');
    if (!targetMember) throw new ApiError(404, 'project member not found');
    // attach target member for downstream handlers (optional)
    req.targetMember = targetMember;
    projectId = targetMember.project;
  }

  if (!projectId) {
    throw new ApiError(400, 'projectId or memberId is required');
  }

  // allow global admin
  if (req.user && req.user.role === ROLES.ADMIN) {
    return next();
  }

  // check if requester is a leader on the project
  const leader = await ProjectMember.findOne({ project: projectId, user: req.user._id, role: ROLES.LEADER });
  if (!leader) {
    throw new ApiError(403, 'Access denied. Only project leader or admin can perform this action.');
  }

  req.projectId = projectId;
  next();
});

export { projectLeaderAuthorization };

import mongoose from "mongoose";
import { ApiError } from "../../utils/apierror.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ProjectMember } from "../../models/projectMember.models.js";

const assigneeAuthorization = asyncHandler(async (req, res, next) => {  
    const projectId = req.projectId; // Get from issueExistAuthorization middleware
    const { newAssigneeId } = req.body;

    // 1️⃣ Validate projectId exists
    if (!projectId) {
        throw new ApiError(400, "Project ID not found in request");
    }

    // 2️⃣ Validate projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid projectId");
    }

    // 3️⃣ Validate assignee is provided
    if (!newAssigneeId) {
        throw new ApiError(400, "Assignee is required");
    }

    // 4️⃣ Validate assignee format
    if (!mongoose.Types.ObjectId.isValid(newAssigneeId)) {
        throw new ApiError(400, "Invalid assignee ID");
    }

    // 5️⃣ Check if assignee is a member of the project and is active
    const assigneeData = await ProjectMember.findOne({
        project: projectId,
        user: newAssigneeId,
        isActive: true
    });

    if (!assigneeData) {
        throw new ApiError(
            403,
            "User is not an active member of this project and cannot be assigned"
        );
    }

    // 6️⃣ Store assignee data in request for later use
    req.assigneeData = assigneeData;

    next();
});

export { assigneeAuthorization };
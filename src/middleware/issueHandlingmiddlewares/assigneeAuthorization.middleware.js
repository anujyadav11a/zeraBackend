import mongoose from "mongoose";
import { ApiError } from "../../utils/apierror.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ProjectMember } from "../../models/projectMember.models.js";

const assigneeAuthorization = asyncHandler(async (req, res, next) => {  
    const { projectId } = req.params;
    const { assignee } = req.body;

    // 1️⃣ Validate projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid projectId");
    }

    // 2️⃣ Validate assignee is provided
    if (!assignee) {
        throw new ApiError(400, "Assignee is required");
    }

    // 3️⃣ Validate assignee format
    if (!mongoose.Types.ObjectId.isValid(assignee)) {
        throw new ApiError(400, "Invalid assignee ID");
    }

    // 4️⃣ Check if assignee is a member of the project and is active
    const assigneeData = await ProjectMember.findOne({
        project: projectId,
        user: assignee,
        isActive: true
    });

    if (!assigneeData) {
        throw new ApiError(
            403,
            "User is not an active member of this project and cannot be assigned"
        );
    }

    // 5️⃣ Store assignee data in request for later use
    req.assigneeData = assigneeData;
    req.projectId = issue.project;


    next();
});

export { assigneeAuthorization };
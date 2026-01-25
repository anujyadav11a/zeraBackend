import mongoose from "mongoose";
import { Issue } from "../../models/IsuueSchema/issue.models.js";
import { ApiError } from "../../utils/apierror.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const issueExistAuthorization = asyncHandler(async (req, res, next) => {
    const { issueId } = req.params;

    // Validate issueId format
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        throw new ApiError(400, "Invalid issue ID format");
    }

    // Check if issue exists and is not deleted
    const issue = await Issue.findOne({
        _id: issueId,
        isDeleted: false
    })
        .select("projectId project")
        .lean();

    if (!issue) {
        throw new ApiError(404, "Issue not found or has been deleted");
    }

    // Add issue's project ID to request for next middleware
    req.projectId = issue.project.id || issue.project;
    req.issue = issue;

    next();
});

export { issueExistAuthorization };

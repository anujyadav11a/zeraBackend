import mongoose from "mongoose";
import { Issue } from "../models/issue.model.js";
import { ApiError } from "../utils/ApiError.js";

 const authorizeIssueAccess = async (req, res, next) => {
    const { issueId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Validate issueId
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        throw new ApiError(400, "Invalid issueId");
    }

    // 2️⃣ Fetch minimal issue data
    const issue = await Issue.findOne({
        _id: issueId,
        isDeleted: false
    })
        .select("assignee reporter project")
        .lean();

    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    // 3️⃣ Authorization logic
    const isAuthorized =
        issue.assignee?.toString() === userId.toString() ||
        issue.reporter?.toString() === userId.toString();

    if (!isAuthorized) {
        throw new ApiError(403, "Access denied to this issue");
    }

    // 4️⃣ Attach issue to request (avoid re-query)
    req.issue = issue;

    next();
};
export { authorizeIssueAccess };
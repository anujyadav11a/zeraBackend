import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { Project } from "../models/project.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { buildquery } from "../utils/quirybuilder.js";
import { Issue } from "../../models/IsuueSchema/issue.models.js";
import { ProjectMember } from "../../models/projectMember.models.js";
import { User } from "../../models/user.models.js";
import { buildPopulation, applyPopulation } from "../utils/populationBuilder.js";
import { notifyAssignee } from "../Email/email.contrller.js";

const assignIssueTOUser = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const { assignee } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        throw new ApiError(400, "Invalid issueId");
    }

    if (!mongoose.Types.ObjectId.isValid(assignee)) {
        throw new ApiError(400, "Invalid assignee");
    }

    // Start session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Fetch issue with lock (read with consistency)
        const issue = await Issue.findOne({
            _id: issueId,
            isDeleted: { $ne: true }
        }).session(session);

        if (!issue) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(404, "Issue not found");
        }

        // Check if issue status allows reassignment
        if (["closed", "archived"].includes(issue.status)) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(409, `Cannot assign issue with status: ${issue.status}`);
        }

        const previousAssignee = issue.assignee || null;

        // Atomic update with optimistic locking using __v
        let updateQuery = Issue.findByIdAndUpdate(
            issueId,
            {
                assignee,
                $inc: { __v: 1 },
                $push: {
                    history: {
                        action: "REASSIGN",
                        field: "assignee",
                        by: userId,
                        from: previousAssignee,
                        to: assignee,
                        at: new Date()
                    }
                }
            },
            { new: true, session }
        );

        // Apply conditional population based on query params
        const populateParam = req.query.populate;
        if (populateParam) {
            const populateArray = buildPopulation(populateParam);
            updateQuery = applyPopulation(updateQuery, populateArray);
        } else {
            updateQuery = updateQuery.populate("assignee", "name email");
        }

        const updatedIssue = await updateQuery;

        await session.commitTransaction();
        session.endSession();

        // Send notification to assignee
        
            await notifyAssignee(
                { email: updatedIssue.assignee.email, name: updatedIssue.assignee.name },
                { title: updatedIssue.title, description: updatedIssue.description, status: updatedIssue.status, priority: updatedIssue.priority },
                { name: updatedIssue.project?.name || 'Unknown Project' }
            );
        
        return res
            .status(200)
            .json(new ApiResponse(200, updatedIssue, "Issue assigned successfully"));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

const reassignIssue = asyncHandler(async (req, res) => {
    const { projectId, issueId } = req.params;
    const { newAssigneeId, reason = "" } = req.body;
    const requesterId = req.user._id;

    // Validate input parameters
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        throw new ApiError(400, "Invalid issueId");
    }

    if (!mongoose.Types.ObjectId.isValid(newAssigneeId)) {
        throw new ApiError(400, "Invalid newAssigneeId");
    }

    // Start session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Fetch and validate issue exists and belongs to project with lock
        const issue = await Issue.findOne({
            _id: issueId,
            project: projectId,
            isDeleted: { $ne: true }
        }).session(session);

        if (!issue) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(404, "Issue not found in this project");
        }

        // Validate new assignee exists
        const newAssignee = await User.findOne({
            _id: newAssigneeId,
            isDeleted: { $ne: true }
        }).session(session);

        if (!newAssignee) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(400, "New assignee user not found");
        }

        // Validate new assignee is an active project member
        const isProjectMember = await ProjectMember.findOne({
            project: projectId,
            user: newAssigneeId,
            isActive: true,
            $or: [
                { removedAt: { $exists: false } },
                { removedAt: null }
            ]
        }).session(session);

        if (!isProjectMember) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(400, "New assignee is not an active member of this project");
        }

        // Check edge case: issue status is closed or archived
        if (["closed", "done"].includes(issue.status)) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(409, `Cannot reassign issue with status: ${issue.status}`);
        }

        const oldAssigneeId = issue.assignee || null;

        // Handle self-reassignment (issue already assigned to same user)
        if (oldAssigneeId && oldAssigneeId.toString() === newAssigneeId) {
            // Log as history entry with optimistic locking
            let selfReassignQuery = Issue.findByIdAndUpdate(
                issueId,
                {
                    $inc: { __v: 1 },
                    $push: {
                        history: {
                            action: "REASSIGN",
                            field: "assignee",
                            by: requesterId,
                            from: oldAssigneeId,
                            to: newAssigneeId,
                            reason,
                            at: new Date()
                        }
                    }
                },
                { new: true, session }
            );

            // Apply conditional population
            const populateParam = req.query.populate;
            if (populateParam) {
                const populateArray = buildPopulation(populateParam);
                selfReassignQuery = applyPopulation(selfReassignQuery, populateArray);
            } else {
                selfReassignQuery = selfReassignQuery.populate("assignee", "name email")
                    .populate("reporter", "name email");
            }

            const updatedIssue = await selfReassignQuery;

            await session.commitTransaction();
            session.endSession();

            return res
                .status(200)
                .json(new ApiResponse(200, updatedIssue, "Issue reassignment logged (no change needed)"));
        }

        // Perform reassignment with optimistic locking
        let reassignQuery = Issue.findByIdAndUpdate(
            issueId,
            {
                assignee: newAssigneeId,
                $inc: { __v: 1 },
                $push: {
                    history: {
                        action: "REASSIGN",
                        field: "assignee",
                        by: requesterId,
                        from: oldAssigneeId,
                        to: newAssigneeId,
                        reason,
                        at: new Date()
                    }
                }
            },
            { new: true, session }
        );

        // Apply conditional population
        const populateParamReassign = req.query.populate;
        if (populateParamReassign) {
            const populateArray = buildPopulation(populateParamReassign);
            reassignQuery = applyPopulation(reassignQuery, populateArray);
        } else {
            reassignQuery = reassignQuery.populate("assignee", "name email")
                .populate("reporter", "name email")
                .populate("history.by", "name email");
        }

        const updatedIssue = await reassignQuery;

        await session.commitTransaction();
        session.endSession();

        // Send notification to new assignee
        try {
            await notifyAssignee(
                { email: updatedIssue.assignee.email, name: updatedIssue.assignee.name },
                { title: updatedIssue.title, description: updatedIssue.description, status: updatedIssue.status, priority: updatedIssue.priority },
                { name: updatedIssue.project?.name || 'Unknown Project' }
            );
        } catch (notificationError) {
            console.error("Failed to send notification email:", notificationError);
            // Don't fail the request if notification fails
        }

        return res
            .status(200)
            .json(new ApiResponse(200, updatedIssue, "Issue reassigned successfully"));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});


const unassignIssue = asyncHandler(async (req, res) => {
    const { projectId, issueId } = req.params;
    const { reason = "" } = req.body;
    const requesterId = req.user._id;

    // -------------------- Validations --------------------
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        throw new ApiError(400, "Invalid issueId format");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid projectId format");
    }

    if (!mongoose.Types.ObjectId.isValid(requesterId)) {
        throw new ApiError(400, "Invalid user token");
    }

    if (reason && typeof reason !== "string") {
        throw new ApiError(400, "Reason must be a string");
    }

    if (reason && reason.trim().length > 500) {
        throw new ApiError(400, "Reason cannot exceed 500 characters");
    }

   
    const issue = await Issue.findOne({
        _id: issueId,
        project: projectId,
        isDeleted: { $ne: true }
    }).select("assignee status");

    if (!issue) {
        throw new ApiError(404, "Issue not found in this project");
    }

    if (!issue.assignee) {
        throw new ApiError(400, "Issue is already unassigned");
    }

    const lockedStatuses = ["closed", "done"];
    if (lockedStatuses.includes(issue.status)) {
        throw new ApiError(
            409,
            `Cannot unassign issue with status: ${issue.status}. Issue is locked.`
        );
    }

   
    let unassignQuery = Issue.findOneAndUpdate(
        {
            _id: issueId,
            assignee: { $ne: null },
            status: { $nin: lockedStatuses }
        },
        {
            assignee: null,
            $inc: { __v: 1 },
            $push: {
                history: {
                    action: "UNASSIGN",
                    field: "assignee",
                    by: requesterId,
                    from: issue.assignee,
                    to: null,
                    reason: reason.trim() || "No reason provided",
                    at: new Date()
                }
            }
        },
       
    );

   

    const updatedIssue = await unassignQuery;

    if (!updatedIssue) {
        throw new ApiError(
            409,
            
            "Issue could not be unassigned (possibly already unassigned or locked)"
        );
    }

    
    return res.status(200).json(
        new ApiResponse(
            200,
            reason,
            "Issue unassigned successfully"
        )
    );
});


export { assignIssueTOUser, reassignIssue, unassignIssue };
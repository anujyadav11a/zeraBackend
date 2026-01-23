import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { Project } from "../models/project.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { buildquery } from "../utils/quirybuilder.js";
import { Issue } from "../../models/IsuueSchema/issue.models.js";
import { buildPopulation, applyPopulation } from "../utils/populationBuilder.js";


export const createIssue = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const {
        title,
        description,
        type,
        priority,
        status,
        assignee,
        labels,
        estimate,
        dueDate,
        parent
    } = req.body;

    // 🔹 Validate required fields
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    // 🔹 Check project exists
    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }
    // Estimate validation
    if (estimate !== undefined) {
        if (typeof estimate !== "number" || estimate < 0) {
            return res.status(400).json({ message: "Estimate must be a non-negative number" });
        }
    }

    // Due date validation
    if (dueDate !== undefined) {
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) {
            return res.status(400).json({ message: "Invalid due date" });
        }

        if (due < new Date()) {
            return res.status(400).json({ message: "Due date cannot be in the past" });
        }
    }




    // 4️⃣ Parent validation (ONLY if parent is provided)
    if (parent) {
        const parentIssue = await Issue.findById(parent);

        if (!parentIssue) {
            return res.status(404).json({ message: "Parent issue not found" });
        }

        if (parentIssue.project.toString() !== projectId) {
            return res.status(400).json({
                message: "Parent issue must belong to the same project"
            });
        }

        if (parentIssue.type === "subtask") {
            return res.status(400).json({
                message: "Subtask cannot be a parent issue"
            });
        }

        if (type !== "subtask") {
            return res.status(400).json({
                message: "Only subtasks can have a parent"
            });
        }
    }



    // 🔹 Generate Issue Key (e.g. PROJ-12)
    const issueCount = await Issue.countDocuments({ project: projectId });
    const issueKey = `${project.key}-${issueCount + 1}`;

    // 🔹 Create issue
    const issue = await Issue.create({
        project: projectId,
        key: issueKey,
        title,
        description,
        type,
        priority,
        priorityOrder,
        status,
        reporter: req.user._id,
        assignee,
        labels,
        estimate,
        dueDate,
        parent,
        history: [
            {
                by: req.user._id,
                from: null,
                to: "created",
                note: "Issue created"
            }
        ]
    });

    const PRIORITY_MAP = {
        urgent: 1,
        high: 2,
        medium: 3,
        low: 4
    };

    issue.priorityOrder = PRIORITY_MAP[issue.priority];

    res.status(201).json(
        new ApiResponse(201, issue, "Issue created successfully")
    );
})
const DeleteIssue = asyncHandler(async (req, res) => {
    const deleteIssue = asyncHandler(async (req, res) => {
        const { issueId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            throw new ApiError(400, "Invalid issueId");
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1️⃣ Soft delete main issue
            const issue = await Issue.findOneAndUpdate(
                { _id: issueId, isDeleted: false },
                {
                    isDeleted: true,
                    deletedBy: req.user._id,
                    deletedAt: new Date()
                },
                { new: true, session }
            );

            if (!issue) {
                throw new ApiError(404, "Issue not found or already deleted");
            }

            // 2️⃣ Cascade delete subtasks
            if (issue.type !== "subtask") {
                await Issue.updateMany(
                    {
                        parent: issueId,
                        type: "subtask",
                        isDeleted: false
                    },
                    {
                        isDeleted: true,
                        deletedBy: req.user._id,
                        deletedAt: new Date()
                    },
                    { session }
                );
            }

            await session.commitTransaction();
            session.endSession();

            return res
                .status(200)
                .json(new ApiResponse(200, null, "Issue deleted successfully"));

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    });

})
const GetIssue = asyncHandler(async (req, res) => {
    const { issueId } = req.params;

    let query = Issue.findOne({ _id: issueId, isDeleted: { $ne: true } });

    // Apply conditional population based on query params
    const populateParam = req.query.populate;
    if (populateParam) {
        const populateArray = buildPopulation(populateParam);
        query = applyPopulation(query, populateArray);
    } else {
        query = query.populate('assignee', 'name email')
            .populate('reporter', 'name email')
            .populate('parent', 'key title');
    }

    const issue = await query.lean();
    
    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }
    
    return res
        .status(200)
        .json(new ApiResponse(200, issue, "Issue fetched successfully"));
})
const UpdateIssue = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const userId = req.user._id;

    const allowedUpdates = [
        "title",
        "description",
        "status",  
        "priority",
        "dueDate"
    ];

    // Start session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const issue = await Issue.findOne({
            _id: issueId,
            isDeleted: { $ne: true }
        }).session(session);

        if (!issue) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(404, "Issue not found");
        }

        const updates = {};
        const historyEntries = [];

        allowedUpdates.forEach(field => {
            if (
                req.body[field] !== undefined &&
                req.body[field] !== issue[field]
            ) {
                updates[field] = req.body[field];

                historyEntries.push({
                    action: field === "status" ? "STATUS_CHANGE" : field === "priority" ? "PRIORITY_CHANGE" : "UPDATE",
                    field: field,
                    by: userId,
                    from: issue[field],
                    to: req.body[field],
                    at: new Date()
                });
            }
        });

        if (Object.keys(updates).length === 0) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiError(400, "No valid changes detected");
        }

        // Add version increment for optimistic locking
        const updatedIssue = await Issue.findByIdAndUpdate(
            issueId,
            {
                $set: updates,
                $inc: { __v: 1 },
                $push: { history: { $each: historyEntries } }
            },
            {
                new: true,
                runValidators: true,
                session
            }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            data: updatedIssue
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const ListIssues = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, 'Invalid projectId');
    }

    // Ensure project exists
    const projectExist = await Project.findById(projectId).select('_id').lean();
    if (!projectExist) {
        throw new ApiError(404, 'Project not found');
    }

    // Extract query parameters
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, priority, assignee, type, labels } = req.query;

    // Pagination
    const { page: parsedPage, limit: parsedLimit, skip } = buildquery({ page, limit });

    // Build filter
    const filter = { project: projectId, isDeleted: { $ne: true } }; // Exclude deleted issues

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (type) filter.type = type;
    if (labels) filter.labels = { $in: Array.isArray(labels) ? labels : [labels] };
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { key: { $regex: search, $options: 'i' } }
        ];
    }

    // Sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'priorityOrder', 'dueDate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Fetch issues and count in parallel
    let issueQuery = Issue.find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(parsedLimit);

    // Apply conditional population based on query params
    const populateParam = req.query.populate;
    if (populateParam) {
        const populateArray = buildPopulation(populateParam);
        issueQuery = applyPopulation(issueQuery, populateArray);
    } else {
        issueQuery = issueQuery.populate('assignee', 'name email')
            .populate('reporter', 'name email')
            .populate('parent', 'key title');
    }

    issueQuery = issueQuery.lean();

    const [issues, total] = await Promise.all([
        issueQuery,
        Issue.countDocuments(filter)
    ]);

    // Pagination meta
    const totalPages = Math.ceil(total / parsedLimit);
    const hasNextPage = parsedPage < totalPages;
    const hasPrevPage = parsedPage > 1;

    // Wrap response in ApiResponse utility
    const apiResponse = new ApiResponse(200, {
        data: issues,
        pagination: {
            currentPage: parsedPage,
            totalPages,
            totalIssues: total,
            hasNextPage,
            hasPrevPage,
            limit: parsedLimit
        }
    }, "Issues fetched successfully");

    res.status(apiResponse.statuscode).json(apiResponse);
});


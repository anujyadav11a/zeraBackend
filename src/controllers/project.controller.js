import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/apiResponse.js";  
import mongoose from "mongoose";
import { buildquery } from "../utils/quirybuilder.js";

const createProject = asyncHandler(async (req, res) => {
   
    const { name, description, startdate, enddate } = req.body;
    if (!name || !name.trim()) {
        throw new ApiError(400, "project name is required");
    }
    const trimmedName = name.trim();
    if (trimmedName.length > 200) {
        throw new ApiError(400, "project name is too long (max 200 characters)");
    }

    // Parse and validate dates if provided
    let startDate;
    let endDate;
    if (startdate) {
        startDate = new Date(startdate);
        if (isNaN(startDate.getTime())) throw new ApiError(400, "invalid startDate");
    }
    if (enddate) {
        endDate = new Date(enddate);
        if (isNaN(endDate.getTime())) throw new ApiError(400, "invalid endDate");
    }
    if (startDate && endDate && startDate > endDate) {
        throw new ApiError(400, "startDate must be before endDate");
    }

    // Check if project exists
    const projectExist = await Project.findOne({ name: trimmedName });
    if (projectExist) {
        throw new ApiError(409, "project already exists");
    }

    // Prepare project payload
    const projectPayload = {
        name: trimmedName,
        description: description || "",
        createdBy: req.user?._id,
        projectHead:req.user?.name
    };
    if (startDate) projectPayload.startDate = startDate;
    if (endDate) projectPayload.endDate = endDate;

    // Try to create project and project member atomically if transactions are supported.
    // Otherwise create project then upsert member and cleanup on failure.
    let projectCreate;
    const sessionSupported = !!(mongoose.connection && mongoose.connection.startSession);

    if (sessionSupported) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const [created] = await Project.create([projectPayload], { session });
            projectCreate = created;

            // Upsert ProjectMember
            const filter = { project: projectCreate._id, user: req.user._id };
            const update = { $setOnInsert: { project: projectCreate._id, user: req.user._id, role: "project_head" } };
            await ProjectMember.findOneAndUpdate(filter, update, { upsert: true, new: true, session, setDefaultsOnInsert: true });

            // increment memberCount atomically
            await Project.findByIdAndUpdate(projectCreate._id, { $inc: { memberCount: 1 } }, { session });

            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    } else {
        // Fallback without transactions
        projectCreate = await Project.create(projectPayload);
        try {
            const filter = { project: projectCreate._id, user: req.user._id };
            const update = { $setOnInsert: { project: projectCreate._id, user: req.user._id, role: "ProjectLeader" } };
            await ProjectMember.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
            await Project.findByIdAndUpdate(projectCreate._id, { $inc: { memberCount: 1 } });
        } catch (err) {
            // cleanup created project if member creation fails
            try {
                await Project.findByIdAndDelete(projectCreate._id);
            } catch (err) {
               throw new ApiError(500, "project member creation failed, and cleanup also failed, manual cleanup may be required");
            }
            throw new ApiError(500, "project member creation failed");
        }
    }

    return res.status(201).json(new ApiResponse(201, projectCreate, "project created successfully"));
});

const addMemberTOproject = asyncHandler(async (req, res)=>{
    const { ProjectId,userId,role}=req.body

    // validate required fields (supports non-string ids as well)
    if ([ProjectId, userId, role].some(field => !field || (typeof field === 'string' && field.trim() === ''))) {
        throw new ApiError(400, "all fields are required")
    }

    if(["project_head","admin"].includes(role)){
        throw new ApiError(400,"invalid role")
    }

    const memberexist = await ProjectMember.findOne({
        project:ProjectId,
        user: userId
    })

    if(memberexist){
        throw new ApiError(409,"user is already a member of the project")
    }

    const addMember= await ProjectMember.create({
        project:ProjectId,
        user:userId,
        role:role,
        joinedAt:new Date(),
        isActive:true
    })
    

      
        try {
            await Project.findByIdAndUpdate(ProjectId, { $inc: { memberCount: 1 } });
        } catch (err) {
           
            try {
                await ProjectMember.deleteOne({ _id: addMember._id });
            } catch (rollbackErr) {
                
                throw new ApiError(500, "Member added but failed to update project count; manual cleanup may be required");
            }
            throw new ApiError(500, "failed to update project member count");
        }

    if(!addMember){
        throw new ApiError(500,"failed to add member to project")
    }

    return res.status(200)
    .json(
       new ApiResponse(
            200,
            addMember,
            "new member added to project successfully"

        )
    )

})

const ListALLMembersofProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
  throw new ApiError(400, 'Invalid projectId');
}


    // ensure project exists
    const projectExist = await Project.findById(projectId).select('_id').lean();
    if (!projectExist) {
        throw new ApiError(404, 'project not found');
    }

    // pagination and limits
  const { page, limit, skip } = buildquery(req.query);

    const { role, isActive, search, sortBy, sortOrder } = req.query;

    // build base match for aggregation
    const match = { project: new mongoose.Types.ObjectId(projectId) };

    const validRoles = ['project_head', 'admin', 'member'];
    if (role) {
        if (!validRoles.includes(role)) throw new ApiError(400, 'invalid role filter');
        match.role = role;
    }

    if (isActive === 'true') match.isActive = true;
    else if (isActive === 'false') match.isActive = false;

    // Sorting
    const allowedSortFields = ['joinedAt', 'role' ];
    let sortField = 'joinedAt';
    if (sortBy && allowedSortFields.includes(sortBy)) sortField = sortBy;
    const order = sortOrder === 'asc' ? 1 : -1;

    // build aggregation pipeline
    const userCollection = User.collection.name; // use actual users collection name
    const pipeline = [
        { $match: match },
        { $lookup: { from: userCollection, localField: 'user', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
    ];

    // server-side search (escape user input for regex)
    if (search && typeof search === 'string' && search.trim() !== '') {
        const raw = search.trim();
        // escape regex special chars
        const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = { $regex: escaped, $options: 'i' };
        pipeline.push({
            $match: {
                $or: [
                    { 'user.name': regex },
                    { 'user.email': regex }
                ]
            }
        });
    }

    // project safe fields to avoid leaking sensitive info
    pipeline.push({
        $project: {
            _id: 1,
            role: 1,
            isActive: 1,
            joinedAt: 1,
            user: {
                _id: '$user._id',
                name: '$user.name',
                email: '$user.email',
                phone: '$user.phone',
                isActive: '$user.isActive'
            }
        }
    });

    // apply sorting
    pipeline.push({ $sort: { [sortField]: order } });

    // facet for pagination + total count
    pipeline.push({
        $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: skip }, { $limit: limit }]
        }
    });

    const agg = await ProjectMember.aggregate(pipeline).allowDiskUse(true).exec();
    const metadata = (agg[0] && agg[0].metadata && agg[0].metadata[0]) || { total: 0 };
    const total = metadata.total || 0;
    const totalPages = total ? Math.ceil(total / limit) : 0;

    // If requested page is out of range return 404 for clarity
    if ((totalPages > 0 && page > totalPages) || (total === 0 && page > 1)) {
        return res.status(404).json(new ApiResponse(404, { members: [], total, page, totalPages }, 'Page not found'));
    }

    const members = (agg[0] && agg[0].data) || [];
return res.status(200).json(new ApiResponse(200, {
  pagination: { total, page, limit, totalPages },
  members
}, 'project members fetched successfully'));

});

const removeMemberFromProject = asyncHandler(async( req, res)=>{
    // allow middleware to provide projectId (req.projectId) or fall back to body/params/query
    const bodyProjectId = req.body?.projectId || req.body?.ProjectId;
    const projectId = req.projectId || bodyProjectId || req.params?.projectId || req.query?.projectId;
    const { userId } = req.body;

    

    if ([projectId, userId].some(field => !field || (typeof field === 'string' && field.trim() === ''))) {
        throw new ApiError(400, "all fields are required")
    }

    

    const removeMember = await ProjectMember.findOne({ project: projectId, user: userId });
   

    if (!removeMember) {
        return res.status(404).json(new ApiResponse(404, null, "user is not member of project"));
    }

    
    const deleteResult = await ProjectMember.deleteOne({ _id: removeMember._id });

    if (!deleteResult || deleteResult.deletedCount === 0) {
        throw new ApiError(500, "failed to remove member from project");
    }

    
    try {
        await Project.findByIdAndUpdate(projectId, { $inc: { memberCount: -1 } });

        
        const proj = await Project.findById(projectId).select('memberCount');
        if (proj && typeof proj.memberCount === 'number' && proj.memberCount < 0) {
            await Project.findByIdAndUpdate(projectId, { $set: { memberCount: 0 } });
        }
    } catch (err) {
        
        const payload = {
            project: removeMember.project,
            user: removeMember.user,
            role: removeMember.role,
            joinedAt: removeMember.joinedAt,
            isActive: removeMember.isActive
        };
        try {
            await ProjectMember.create(payload);
        } catch (rollbackErr) {
          
            throw new ApiError(500, "Member removed but failed to update project count; manual cleanup may be required");
        }

        throw new ApiError(500, "failed to update project member count");
    }

    return res.status(200).json(new ApiResponse(200, null, "member removed successfully"));

})

const getProjectDetails = asyncHandler(async (req,res)=>{
    const {projectId}= req.params
    if(!projectId || projectId.trim()===""){
        throw new ApiError(400,"projectId is required")
    }

    const ProjectExist = await Project.findById(projectId)
    if(!ProjectExist){
        throw new ApiError(404,"project does not exits")

    }

    const Projectdetails = await Project.findById(projectId)
    
    if(!Projectdetails){
        throw new ApiError(401,"failed to get Project details")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            Projectdetails,
            "details fetch successfully"
        )
    )



})

export {
    createProject,
    addMemberTOproject,
    ListALLMembersofProject,
    removeMemberFromProject,
    getProjectDetails
}


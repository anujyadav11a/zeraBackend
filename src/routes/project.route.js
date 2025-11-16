import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { roleAuthorization } from "../middleware/roleAuthoriztion.middleware.js";
import { validateProjectId } from "../middleware/validateProjectId.middleware.js";
import { projectCreatorAuthorization } from "../middleware/projectCreatorAuthorization.middleware.js";
import { projectMemberAuthorization } from "../middleware/projectMemberauth.middleware.js";

import {
    createProject,
    addMemberTOproject,
    ListALLMembersofProject,
    removeMemberFromProject,
    getProjectDetails,
    changeMemberRole,
} from "../controllers/project.controller.js"
import { projectLeaderAuthorization } from "../middleware/projectLeaderAuthorization.middleware.js";

const Projectrouter= Router();

Projectrouter.route("/create-Project").post(verifyToken,createProject)
Projectrouter.route("/get-ProjectDetails/:projectId").get(verifyToken, validateProjectId, getProjectDetails);
Projectrouter.route("/add-Member").post(verifyToken, projectCreatorAuthorization, addMemberTOproject)
Projectrouter.route("/list-Members/:projectId").get(verifyToken,projectMemberAuthorization,ListALLMembersofProject)
Projectrouter.route("/remove-Member").post(verifyToken, projectCreatorAuthorization, removeMemberFromProject)

// change member role: only project leader (for that project) or global admin
Projectrouter.route("/change-member-role/:memberId").post(verifyToken, projectLeaderAuthorization, changeMemberRole)

export {Projectrouter}
import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { roleAuthorization } from "../middleware/roleAuthoriztion.middleware.js";
import { validateProjectId } from "../middleware/validateProjectId.middleware.js";
import { projectCreatorAuthorization } from "../middleware/projectCreatorAuthorization.middleware.js";
import { projectMemberAuthorization } from "../middleware/projectMemberauth.middleware.js";
import { projectLeaderAuthorization } from "../middleware/projectLeaderAuthorization.middleware.js";
import { createIssue } from "../controllers/issueControllers/issue.contoller.js";
import { ListIssues  } from "../controllers/issueControllers/issue.contoller.js";
import { projectCreationLimiter, apiLimiter, issueCreationLimiter } from "../middleware/rateLimiter.middleware.js";

import {
    createProject,
    addMemberTOproject,
    ListALLMembersofProject,
    removeMemberFromProject,
    getProjectDetails,
    changeMemberRole,
} from "../controllers/project.controller.js";


const Projectrouter= Router();

Projectrouter.route("/create-Project").post(projectCreationLimiter, verifyToken, createProject)
Projectrouter.route("/get-ProjectDetails/:projectId").get(apiLimiter, verifyToken, validateProjectId, getProjectDetails);
Projectrouter.route("/add-Member").post(apiLimiter, verifyToken, projectCreatorAuthorization, addMemberTOproject)
Projectrouter.route("/list-Members/:projectId").get(apiLimiter, verifyToken, projectMemberAuthorization, ListALLMembersofProject)
Projectrouter.route("/remove-Member").post(apiLimiter, verifyToken, projectCreatorAuthorization, removeMemberFromProject)

// change member role: only project leader (for that project) or global admin
Projectrouter.route("/change-member-role/:memberId").post(apiLimiter, verifyToken, projectLeaderAuthorization, changeMemberRole)
Projectrouter.route("/:projectId/issues").post(issueCreationLimiter, verifyToken, projectMemberAuthorization, validateProjectId, createIssue);
Projectrouter.route("/:projectId/list-Issues").get(apiLimiter, verifyToken, validateProjectId, projectMemberAuthorization, ListIssues);
export {Projectrouter}
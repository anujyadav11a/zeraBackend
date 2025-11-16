import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { roleAuthorization } from "../middleware/roleAuthoriztion.middleware.js";
import { validateProjectId } from "../middleware/validateProjectId.middleware.js";
import { projectHeadAuthorization } from "../middleware/projectHeadauth.middle.js";
import { projectMemberAuthorization } from "../middleware/projectMemberauth.middleware.js";

import {
    createProject,
    addMemberTOproject,
    ListALLMembersofProject,
    removeMemberFromProject,
    getProjectDetails,
    
} from "../controllers/project.controller.js"

const Projectrouter= Router();

Projectrouter.route("/create-Project").post(verifyToken,createProject)
Projectrouter.route("/get-ProjectDetails/:projectId").get(verifyToken, validateProjectId, getProjectDetails);
Projectrouter.route("/add-Member").post(verifyToken,projectHeadAuthorization,addMemberTOproject)
Projectrouter.route("/list-Members/:projectId").get(verifyToken,projectMemberAuthorization,ListALLMembersofProject)
Projectrouter.route("/remove-Member").post(verifyToken,projectHeadAuthorization,removeMemberFromProject)

export {Projectrouter}
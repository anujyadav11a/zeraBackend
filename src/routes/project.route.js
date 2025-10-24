import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { roleAuthorization } from "../middleware/roleAuthoriztion.middleware.js";
import { validateProjectId } from "../middleware/validateProjectId.middleware.js";

import {
    createProject,
    addMemberTOproject,
    ListALLMembersofProject,
    removeMemberFromProject,
    getProjectDetails
} from "../controllers/project.controller.js"

const Projectrouter= Router();

Projectrouter.route("/create-Project").post(verifyToken,createProject)
Projectrouter.route("/get-ProjectDetails/:projectId").get(verifyToken, validateProjectId, getProjectDetails);
Projectrouter.route("/add-Member").post(verifyToken,roleAuthorization(["admin","project_head"]),addMemberTOproject)
Projectrouter.route("/list-Members").get(verifyToken,roleAuthorization(["admin","project_head"]),ListALLMembersofProject)
Projectrouter.route("/remove-Member").post(verifyToken,roleAuthorization(["admin","project_head"]),removeMemberFromProject)

export {Projectrouter}
import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { roleAuthorization } from "../middleware/roleAuthoriztion.middleware.js";
import { validateProjectId } from "../middleware/validateProjectId.middleware.js";
import { projectCreatorAuthorization } from "../middleware/projectCreatorAuthorization.middleware.js";
import { projectMemberAuthorization } from "../middleware/projectMemberauth.middleware.js";
import { projectLeaderAuthorization } from "../middleware/projectLeaderAuthorization.middleware.js";

import{
     
    DeleteIssue,
    GetIssue,
    UpdateIssue,
    ListIssues
} from "../controllers/issueControllers/issue.contoller.js";
 


const issueRouter = Router();

// Create issue - requires projectId in URL for project context


// Get/Update/Delete issue - derives projectId from issueId
issueRouter.route("/get-Issue/:issueId").get(verifyToken, GetIssue);
issueRouter.route("/update-Issue/:issueId").put(verifyToken, projectMemberAuthorization, validateProjectId, UpdateIssue);
issueRouter.route("/delete-Issue/:issueId").delete(verifyToken, projectLeaderAuthorization, validateProjectId, DeleteIssue);

// List issues - requires projectId in URL
issueRouter.route("/list-Issues/:projectId").get(verifyToken, projectMemberAuthorization, validateProjectId, ListIssues);

export {issueRouter}
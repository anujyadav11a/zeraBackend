import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { roleAuthorization } from "../middleware/roleAuthoriztion.middleware.js";
import { validateProjectId } from "../middleware/validateProjectId.middleware.js";
import { projectCreatorAuthorization } from "../middleware/projectCreatorAuthorization.middleware.js";
import { projectMemberAuthorization } from "../middleware/projectMemberauth.middleware.js";
import { projectLeaderAuthorization } from "../middleware/projectLeaderAuthorization.middleware.js";
import { issueExistAuthorization } from "../middleware/issueHandlingmiddlewares/issueExistAuthorization.middleware.js";
import { authorizeIssueAccess } from "../middleware/issueHandlingmiddlewares/issueAcess.middleware.js";
import {assigneeAuthorization} from "../middleware/issueHandlingmiddlewares/assigneeAuthorization.middleware.js";
import{
     
    DeleteIssue,
    GetIssue,
    UpdateIssue,
    
    
} from "../controllers/issueControllers/issue.contoller.js";
 
import {
   assignIssueTOUser, reassignIssue, unassignIssue
} from "../controllers/issueControllers/issueAssign.controller.js";


const issueRouter = Router();




// Get/Update/Delete issue - derives projectId from issueId
issueRouter.route("/get-Issue/:issueId").get(verifyToken,issueExistAuthorization,projectMemberAuthorization, GetIssue);
issueRouter.route("/update-Issue/:issueId").put(verifyToken, issueExistAuthorization,authorizeIssueAccess, UpdateIssue);
issueRouter.route("/delete-Issue/:issueId").delete(verifyToken, issueExistAuthorization,projectLeaderAuthorization, DeleteIssue);
issueRouter.route("/assign-issue/:issueId").post(verifyToken, issueExistAuthorization, assigneeAuthorization, projectLeaderAuthorization, assignIssueTOUser);
issueRouter.route("/reassign-issue/:issueId").post(verifyToken, issueExistAuthorization, assigneeAuthorization, projectLeaderAuthorization, reassignIssue);
issueRouter.route("/unassign-issue/:issueId").post(verifyToken, issueExistAuthorization, projectLeaderAuthorization, unassignIssue);

export {issueRouter}
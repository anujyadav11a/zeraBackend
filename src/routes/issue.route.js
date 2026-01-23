import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { roleAuthorization } from "../middleware/roleAuthoriztion.middleware.js";
import { validateProjectId } from "../middleware/validateProjectId.middleware.js";
import { projectCreatorAuthorization } from "../middleware/projectCreatorAuthorization.middleware.js";
import { projectMemberAuthorization } from "../middleware/projectMemberauth.middleware.js";
import { projectLeaderAuthorization } from "../middleware/projectLeaderAuthorization.middleware.js";

import{
     createIssue,
    DeleteIssue,
    GetIssue,
    UpdateIssue,
    ListIssues
} from "../controllers/issueControllers/issue.contoller.js";
 


const IssueRouter = Router();

IssueRouter.route("/create-Issue").post(verifyToken,projectMemberAuthorization, createIssue);
IssueRouter.route("/get-Issue/:issueId").get(verifyToken,projectMemberAuthorization, validateProjectId, GetIssue);
IssueRouter.route("/update-Issue/:issueId").put(verifyToken,projectMemberAuthorization, validateProjectId, UpdateIssue);
IssueRouter.route("/delete-Issue/:issueId").delete(verifyToken,projectLeaderAuthorization, validateProjectId, DeleteIssue);
IssueRouter.route("/list-Issues/:projectId").get(verifyToken,projectMemberAuthorization, validateProjectId, ListIssues);

export {IssueRouter}
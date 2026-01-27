import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { emailQueue } from "./email.queue.js";

import { issueAssignmentTemplate } from "../../templates/emailTemplates.js";



const notifyAssignee = async (assigneeData, issueData, projectData) => {
     if (!assigneeData || !assigneeData.email) {
          console.warn("Assignee has no email address, skipping notification");
          return null;
     }

     // Get email template
     const { subject, html } = issueAssignmentTemplate(assigneeData, issueData, projectData);

     try {
          const job = await emailQueue.add(
               {
                    to: assigneeData.email,
                    subject: subject,
                    html: html
               },
               {
                    jobId: `notify-assignee-${issueData._id}-${assigneeData._id}`,
                    attempts: 5,
                    backoff: {
                         type: 'exponential',
                         delay: 2000
                    },
                    removeOnComplete: true,
                    removeOnFail: 50
               }
          );
          console.log(`[EMAIL QUEUED] issue=${issueData._id} assignee=${assigneeData.email}`);
          return job;
     } catch (error) {
          console.error("Failed to enqueue email notification:", error.message);
          return null;
     }
};

export { notifyAssignee };
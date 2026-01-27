import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { emailQueue } from "./email.queue.js";
import { Issue } from "../../models/IsuueSchema/issue.models.js";


/**
 * Notify assignee about issue assignment via email
 * @param {Object} assigneeData - The assignee user object with email and name
 * @param {Object} issueData - The issue object with title and other details
 * @param {Object} projectData - The project object with name
 * @returns {Promise} - Returns the email queue job
 */
const notifyAssignee = async (assigneeData, issueData, projectData) => {
     if (!assigneeData || !assigneeData.email) {
          console.warn("Assignee has no email address, skipping notification");
          return null;
     }

     const subject = `New Issue Assigned: ${issueData.title}`;
     const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #333;">New Issue Assigned</h2>
               <p>Hello <strong>${assigneeData.name}</strong>,</p>
               <p>You have been assigned a new issue.</p>
               <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Issue Title:</strong> ${issueData.title}</p>
                    <p><strong>Project:</strong> ${projectData?.name || 'N/A'}</p>
                    <p><strong>Status:</strong> ${issueData.status || 'Open'}</p>
                    ${issueData.description ? `<p><strong>Description:</strong> ${issueData.description}</p>` : ''}
                    ${issueData.priority ? `<p><strong>Priority:</strong> ${issueData.priority}</p>` : ''}
               </div>
               <p>Please log in to the system to view more details about this issue.</p>
               <br/>
               <p>Best regards,<br/>Project Management System</p>
          </div>
     `;

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
          console.log(`Email notification queued for ${assigneeData.email}`);
          return job;
     } catch (error) {
          console.error("Failed to enqueue email notification:", error.message);
          return null;
     }
};

export { notifyAssignee };
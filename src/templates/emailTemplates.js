/**
 * Email Template for Issue Assignment Notification
 * @param {Object} assigneeData - The assignee user object with name
 * @param {Object} issueData - The issue object with title, description, status, priority, and _id
 * @param {Object} projectData - The project object with name
 * @returns {Object} - Object containing subject and html
 */
export const issueAssignmentTemplate = (assigneeData, issueData, projectData) => {
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

     return { subject, html };
};

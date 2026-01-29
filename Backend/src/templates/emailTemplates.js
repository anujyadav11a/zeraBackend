
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

export const issueReassignmentOldAssigneeTemplate = (oldAssigneeData, newAssigneeData, issueData, projectData) => {
     const subject = `Issue Reassigned: ${issueData.title}`;
     const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #333;">Issue Reassigned</h2>
               <p>Hello <strong>${oldAssigneeData.name}</strong>,</p>
               <p>The issue you were assigned to has been reassigned to another team member.</p>
               <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Issue Title:</strong> ${issueData.title}</p>
                    <p><strong>Project:</strong> ${projectData?.name || 'N/A'}</p>
                    <p><strong>Status:</strong> ${issueData.status || 'Open'}</p>
                    <p><strong>New Assignee:</strong> ${newAssigneeData?.name || 'Unassigned'}</p>
                    ${issueData.description ? `<p><strong>Description:</strong> ${issueData.description}</p>` : ''}
                    ${issueData.priority ? `<p><strong>Priority:</strong> ${issueData.priority}</p>` : ''}
               </div>
               <p>If you have any questions, please contact your project manager.</p>
               <br/>
               <p>Best regards,<br/>Project Management System</p>
          </div>
     `;

     return { subject, html };
};

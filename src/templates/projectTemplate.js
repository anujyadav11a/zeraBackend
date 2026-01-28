export const addProjectMemberTemplate = (memberData,  projectData) => {
     const subject = `New Project Assigned: ${memberData.title}`;
     const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #333;">you are assigned with a new project</h2>
               <p>Hello <strong>${memberData.name}</strong>,</p>
               <p>You have been assigned a new project.</p>
               <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>project Title:</strong> ${projectData?.name || 'N/A'}</p>
                    <p><strong>Project:</strong> ${projectData?.name || 'N/A'}</p>
                    <p><strong>Status:</strong> ${projectData?.status || 'Open'}</p>
                    ${projectData?.description ? `<p><strong>Description:</strong> ${projectData.description}</p>` : ''}
                    ${projectData?.priority ? `<p><strong>Priority:</strong> ${projectData.priority}</p>` : ''}
               </div>
               <p>Please log in to the system to view more details about this project.</p>
               <br/>
               <p>Best regards,<br/>Project Management System</p>
          </div>
     `;

     return { subject, html };
};

export const removeProjectMemberTemplate = (memberData, projectData) => {
     const subject = `Removed from Project: ${projectData?.name || 'N/A'}`;
     const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #333;">You have been removed from a project</h2>
               <p>Hello <strong>${memberData.name}</strong>,</p>
               <p>You have been removed from the following project.</p>
               <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Project Title:</strong> ${projectData?.name || 'N/A'}</p>
                    <p><strong>Status:</strong> ${projectData?.status || 'Open'}</p>
                    ${projectData?.description ? `<p><strong>Description:</strong> ${projectData.description}</p>` : ''}
                    ${projectData?.priority ? `<p><strong>Priority:</strong> ${projectData.priority}</p>` : ''}
               </div>
               <p>Please log in to the system to view more details about this project.</p>
               <br/>
               <p>Best regards,<br/>Project Management System</p>
          </div>
     `;

     return { subject, html };
};

export const changeMemberRoleTemplate = (memberData, projectData, oldRole, newRole) => {    
        const subject = `Role Changed: ${projectData?.name || 'N/A'}`;
     const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #333;">Your role is changed for project</h2>
               <p>Hello <strong>${memberData.name}</strong>,</p>
               <p>Your role has been changed in the following project.</p>
               <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Project Title:</strong> ${projectData?.name || 'N/A'}</p>
                    <p><strong>Status:</strong> ${projectData?.status || 'Open'}</p>
                    ${projectData?.description ? `<p><strong>Description:</strong> ${projectData.description}</p>` : ''}
                    ${projectData?.priority ? `<p><strong>Priority:</strong> ${projectData.priority}</p>` : ''}
                    <p><strong>Old Role:</strong> ${oldRole}</p>
                    <p><strong>New Role:</strong> ${newRole}</p>
               </div>
               <p>Please log in to the system to view more details about this project.</p>
               <br/>
               <p>Best regards,<br/>Project Management System</p>
          </div>
     `;

     return { subject, html };

};

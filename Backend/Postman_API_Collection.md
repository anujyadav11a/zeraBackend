# Postman API Testing Collection

Base URL: `http://localhost:8000/api/v1`

## 🔐 Authentication APIs

### 1. User Registration
```
POST http://localhost:8000/api/v1/User/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "developer"
}
```

### 2. User Login
```
POST http://localhost:8000/api/v1/User/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```
**Response:** Save `accessToken` and `refreshToken` for subsequent requests

### 3. User Logout
```
POST http://localhost:8000/api/v1/User/Logout
Authorization: Bearer {{accessToken}}
Cookie: refreshToken={{refreshToken}}
```

### 4. Change Password
```
POST http://localhost:8000/api/v1/User/changePassword
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "oldPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

## 📋 Project Management APIs

### 5. Create Project
```
POST http://localhost:8000/api/v1/project/create-Project
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "E-Commerce Platform",
  "description": "Full-stack e-commerce application with React and Node.js",
  "projectHead": "john.doe@example.com",
  "status": "active"
}
```

### 6. Get Project Details
```
GET http://localhost:8000/api/v1/project/get-ProjectDetails/{{projectId}}
Authorization: Bearer {{accessToken}}
```

### 7. Add Member to Project
```
POST http://localhost:8000/api/v1/project/add-Member
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "projectId": "{{projectId}}",
  "email": "member@example.com",
  "role": "developer"
}
```

### 8. List Project Members
```
GET http://localhost:8000/api/v1/project/list-Members/{{projectId}}
Authorization: Bearer {{accessToken}}
```

### 9. Remove Member from Project
```
POST http://localhost:8000/api/v1/project/remove-Member
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "projectId": "{{projectId}}",
  "memberId": "{{memberId}}"
}
```

### 10. Change Member Role
```
POST http://localhost:8000/api/v1/project/change-member-role/{{memberId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "projectId": "{{projectId}}",
  "newRole": "leader"
}
```

## 🎯 Issue Management APIs

### 11. Create Issue
```
POST http://localhost:8000/api/v1/project/{{projectId}}/issues
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system with login/register functionality",
  "type": "task",
  "priority": "high",
  "labels": ["authentication", "security"],
  "estimate": 8,
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

### 12. List Project Issues
```
GET http://localhost:8000/api/v1/project/{{projectId}}/list-Issues
Authorization: Bearer {{accessToken}}

# With conditional population
GET http://localhost:8000/api/v1/project/{{projectId}}/list-Issues?populate=assignee,reporter
GET http://localhost:8000/api/v1/project/{{projectId}}/list-Issues?populate=assignee:name,email;reporter:name
```

### 13. Get Issue Details
```
GET http://localhost:8000/api/v1/issue/get-Issue/{{issueId}}
Authorization: Bearer {{accessToken}}

# With conditional population
GET http://localhost:8000/api/v1/issue/get-Issue/{{issueId}}?populate=assignee,reporter,parent
GET http://localhost:8000/api/v1/issue/get-Issue/{{issueId}}?populate=assignee:name,email,avatar;reporter:name
```

### 14. Update Issue
```
PUT http://localhost:8000/api/v1/issue/update-Issue/{{issueId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "title": "Implement user authentication with 2FA",
  "description": "Add JWT-based authentication system with two-factor authentication",
  "status": "in_progress",
  "priority": "urgent",
  "labels": ["authentication", "security", "2fa"],
  "estimate": 12
}
```

### 15. Delete Issue
```
DELETE http://localhost:8000/api/v1/issue/delete-Issue/{{issueId}}
Authorization: Bearer {{accessToken}}
```

### 16. Assign Issue to User
```
POST http://localhost:8000/api/v1/issue/assign-issue/{{issueId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "assigneeId": "{{userId}}",
  "reason": "Best suited for this authentication task"
}
```

### 17. Reassign Issue
```
POST http://localhost:8000/api/v1/issue/reassign-issue/{{issueId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "newAssigneeId": "{{newUserId}}",
  "reason": "Reassigning due to workload balancing"
}
```

### 18. Unassign Issue
```
POST http://localhost:8000/api/v1/issue/unassign-issue/{{issueId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "reason": "User unavailable, will reassign later"
}
```

## 🏥 Health Check

### 19. Health Check
```
GET http://localhost:8000/health
```

## 📝 Postman Environment Variables

Create these variables in Postman Environment:

```json
{
  "baseUrl": "http://localhost:8000/api/v1",
  "accessToken": "",
  "refreshToken": "",
  "projectId": "",
  "issueId": "",
  "userId": "",
  "memberId": ""
}
```

## 🔄 Testing Workflow

### Step 1: Authentication Flow
1. **Register** a new user (Admin/Leader role)
2. **Login** with credentials
3. Copy `accessToken` from response to environment variable
4. Copy `refreshToken` from response to environment variable

### Step 2: Project Setup
1. **Create Project** using the logged-in user
2. Copy `projectId` from response to environment variable
3. **Add Members** to the project
4. **List Members** to verify additions

### Step 3: Issue Management
1. **Create Issues** in the project
2. Copy `issueId` from response to environment variable
3. **List Issues** to see all project issues
4. **Assign Issues** to team members
5. **Update Issue** status and details
6. **Get Issue Details** to verify changes

### Step 4: Advanced Testing
1. Test **Conditional Population** with different query parameters
2. Test **Role-based Access** with different user roles
3. Test **Rate Limiting** by making rapid requests
4. Test **Error Handling** with invalid data

## 🧪 Test Scenarios

### Authentication Tests
- Register with invalid email format
- Login with wrong credentials
- Access protected routes without token
- Change password with wrong old password

### Project Tests
- Create project without required fields
- Add non-existent user to project
- Access project without membership
- Change role without proper permissions

### Issue Tests
- Create issue with invalid project ID
- Assign issue to non-project member
- Update issue without proper permissions
- Delete issue without leader/admin role

### Rate Limiting Tests
- Make 6+ login attempts rapidly (should hit rate limit)
- Make 101+ general requests rapidly
- Make 11+ project creation requests in an hour

## 📊 Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "statuscode": 200
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"],
  "statuscode": 400
}
```

### Rate Limit Response
```json
{
  "error": "Too many requests from this IP",
  "message": "Please try again after 15 minutes",
  "retryAfter": 900
}
```

## 🔍 Debugging Tips

1. **Check Headers**: Ensure `Authorization: Bearer {{accessToken}}` is set
2. **Verify Content-Type**: Use `application/json` for POST/PUT requests
3. **Check Environment Variables**: Ensure all variables are properly set
4. **Monitor Console**: Check server logs for detailed error information
5. **Test Rate Limits**: Wait for rate limit windows to reset if needed

## 📋 Postman Collection Import

You can create a Postman collection with these requests. Here's the JSON structure:

```json
{
  "info": {
    "name": "Project Management API",
    "description": "Complete API collection for project management system"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8000/api/v1"
    }
  ]
}
```

## 🚀 Quick Start Commands

For quick testing, you can also use curl commands:

```bash
# Register User
curl -X POST http://localhost:8000/api/v1/User/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!","role":"developer"}'

# Login User
curl -X POST http://localhost:8000/api/v1/User/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Health Check
curl http://localhost:8000/health
```
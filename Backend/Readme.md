# Project Management System API

A robust, production-ready project management backend system built with Node.js, Express, and MongoDB. Features comprehensive issue tracking, user management, and team collaboration tools similar to Jira/Linear.

## 🚀 Features

### Core Functionality
- **User Management**: Registration, authentication, role-based access control
- **Project Management**: Create, manage projects with team members and roles
- **Issue Tracking**: Full lifecycle issue management with status, priority, and assignments
- **Team Collaboration**: Member management, role assignments, and permissions
- **Audit Trail**: Complete history tracking for all operations

### Advanced Features
- **Race Condition Prevention**: MongoDB transactions with optimistic locking
- **Conditional Population**: Efficient data fetching with query-based population
- **Email Queue System**: Asynchronous email processing with Bull and Redis
- **Rate Limiting**: Multi-tier rate limiting for security and performance
- **File Upload**: Cloudinary integration for file management
- **Comprehensive Logging**: Structured logging with Winston
- **Graceful Shutdown**: Proper process management and cleanup

## 🛠 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Queue System**: Bull with Redis
- **File Storage**: Cloudinary
- **Logging**: Winston
- **Security**: bcrypt, CORS, rate limiting, security headers

## 📋 Prerequisites

- Node.js >= 16.x
- MongoDB >= 4.0 (with replica set for transactions)
- Redis >= 6.x (for queue system)
- Cloudinary account (for file uploads)

## ⚡ Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd Backend
npm install
```

### 2. Environment Configuration
Create `.env` file in the Backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/project-management
# For transactions, use replica set:
# MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/project-management?replicaSet=rs0

# JWT Configuration
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
ACCESS_TOKEN_LIFE=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
REFRESH_TOKEN_LIFE=7d

# Redis Configuration (for email queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Project Management System

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 3. Database Setup
```bash
# Start MongoDB with replica set (required for transactions)
mongod --replSet rs0 --port 27017 --dbpath /data/db1
mongod --replSet rs0 --port 27018 --dbpath /data/db2
mongod --replSet rs0 --port 27019 --dbpath /data/db3

# Initialize replica set (run once)
mongo --port 27017
> rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})
```

### 4. Start Services
```bash
# Start Redis
redis-server

# Start the application
npm run dev

# Or for production
npm start
```

### 5. Initialize Default Admin
The system automatically creates a default admin user on first startup. Check the logs for credentials.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints
```http
POST /User/register          # User registration
POST /User/login             # User login
POST /User/Logout            # User logout
POST /User/changePassword    # Change password
```

### Project Endpoints
```http
POST /project/create-Project                    # Create project
GET  /project/get-ProjectDetails/:projectId     # Get project details
POST /project/add-Member                        # Add member to project
GET  /project/list-Members/:projectId           # List project members
POST /project/remove-Member                     # Remove member from project
POST /project/change-member-role/:memberId      # Change member role
POST /project/:projectId/issues                 # Create issue in project
GET  /project/:projectId/list-Issues            # List project issues
```

### Issue Endpoints
```http
GET    /issue/get-Issue/:issueId        # Get issue details
PUT    /issue/update-Issue/:issueId     # Update issue
DELETE /issue/delete-Issue/:issueId     # Delete issue
POST   /issue/assign-issue/:issueId     # Assign issue to user
POST   /issue/reassign-issue/:issueId   # Reassign issue
POST   /issue/unassign-issue/:issueId   # Unassign issue
```

### Query Parameters

#### Conditional Population
Control which fields to populate in responses:
```http
GET /issue/get-Issue/123?populate=assignee,reporter
GET /issue/get-Issue/123?populate=assignee:name,email;reporter:name
GET /project/456/list-Issues?populate=assignee,parent
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access
- **Leader**: Project management, team leadership
- **Developer**: Issue management, development tasks
- **Member**: Basic project participation
- **Viewer**: Read-only access

### JWT Token Flow
1. Login receives access token (15min) and refresh token (7d)
2. Access token required for protected routes
3. Refresh token used to generate new access tokens
4. Tokens include user ID, email, and role

### Permission Matrix
| Action | Admin | Leader | Developer | Member | Viewer |
|--------|-------|--------|-----------|--------|--------|
| Create Project | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Members | ✅ | ✅* | ❌ | ❌ | ❌ |
| Create Issues | ✅ | ✅ | ✅ | ✅ | ❌ |
| Assign Issues | ✅ | ✅* | ❌ | ❌ | ❌ |
| Update Issues | ✅ | ✅* | ✅** | ❌ | ❌ |
| Delete Issues | ✅ | ✅* | ❌ | ❌ | ❌ |

*Only for their projects  
**Only assigned issues

## 🔒 Security Features

### Rate Limiting
- **General**: 100 requests/15min per IP
- **Authentication**: 5 attempts/15min per IP
- **API Endpoints**: 200 requests/15min per IP
- **Password Changes**: 3 attempts/hour per IP
- **Project Creation**: 10 projects/hour per IP
- **Issue Creation**: 50 issues/15min per IP

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- Strict-Transport-Security (HTTPS enforcement)
- X-XSS-Protection

### Input Validation
- Request size limits (10KB for JSON/URL-encoded)
- File upload restrictions
- SQL injection prevention
- XSS protection

## 📊 Monitoring & Logging

### Log Files
```
logs/
├── combined.log    # All log levels
├── error.log       # Error messages only
└── debug.log       # Debug information (dev only)
```

### Health Check
```http
GET /health
```
Returns server status, uptime, and health information.

### Monitoring Endpoints
- Server uptime and memory usage
- Database connection status
- Redis connection status
- Queue processing status

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### Manual Testing
```bash
# Check roles and migrate if needed
npm run roles:check
npm run roles:migrate

# Start email worker separately
npm run email:worker
```

## 🔧 Scripts

```json
{
  "start": "node .",
  "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js",
  "roles:check": "node ./scripts/check_and_migrate_roles.js",
  "roles:migrate": "node ./scripts/check_and_migrate_roles.js --migrate",
  "email:worker": "node src/controllers/Email/email.worker.js"
}
```

## 📁 Project Structure

```
Backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── Email/          # Email queue system
│   │   └── issueControllers/ # Issue management
│   ├── middleware/         # Custom middleware
│   │   └── issueHandlingmiddlewares/ # Issue-specific middleware
│   ├── models/            # Database schemas
│   │   └── IsuueSchema/   # Issue-related models
│   ├── routes/            # API route definitions
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   ├── constants/         # Application constants
│   ├── service/           # External service integrations
│   ├── templates/         # Email and other templates
│   └── db/               # Database connection
├── logs/                 # Application logs
├── public/               # Static files
├── scripts/              # Utility scripts
└── docs/                # Documentation files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**ANUJ YADAV**

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation in `/docs`
- Review the troubleshooting section below

## 🔍 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Ensure MongoDB is running with replica set
mongod --replSet rs0 --port 27017
```

**Redis Connection Error**
```bash
# Start Redis server
redis-server
```

**Email Queue Not Processing**
```bash
# Start email worker
npm run email:worker
```

**Rate Limit Errors**
- Check if IP is being rate limited
- Adjust rate limits in development environment
- Use different IP or wait for reset

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm run dev
```

## 📈 Performance Optimization

- Use conditional population to reduce data transfer
- Implement proper indexing on frequently queried fields
- Use Redis for caching frequently accessed data
- Monitor and optimize database queries
- Use connection pooling for database connections

## 🔮 Roadmap

- [ ] WebSocket integration for real-time updates
- [ ] Advanced search and filtering
- [ ] File attachment system
- [ ] Time tracking functionality
- [ ] Reporting and analytics
- [ ] Mobile API optimizations
- [ ] GraphQL API support
- [ ] Microservices architecture migration
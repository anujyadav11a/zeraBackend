# Rate Limiting Implementation

This document describes the rate limiting implementation for performance enhancement and security.

## Overview

Rate limiting has been implemented to:
- Prevent abuse and DoS attacks
- Improve server performance by controlling request volume
- Protect authentication endpoints from brute force attacks
- Ensure fair resource usage among users

## Installation

First, install the required dependency:

```bash
npm install express-rate-limit
```

## Rate Limiting Configuration

### General Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Applied to**: All requests globally

### Authentication Endpoints
- **Window**: 15 minutes  
- **Limit**: 5 attempts per IP
- **Applied to**: `/api/v1/User/register`, `/api/v1/User/login`
- **Special**: Skips counting successful requests

### API Endpoints
- **Window**: 15 minutes
- **Limit**: 200 requests per IP
- **Applied to**: Most API endpoints

### Password Change
- **Window**: 1 hour
- **Limit**: 3 attempts per IP
- **Applied to**: `/api/v1/User/changePassword`

### Project Creation
- **Window**: 1 hour
- **Limit**: 10 projects per IP
- **Applied to**: `/api/v1/project/create-Project`

### Issue Creation
- **Window**: 15 minutes
- **Limit**: 50 issues per IP
- **Applied to**: `/:projectId/issues`

### Email Sending
- **Window**: 1 hour
- **Limit**: 20 emails per IP
- **Applied to**: Email-related endpoints

## Environment-Based Configuration

### Development Environment
- More lenient limits for easier testing
- General: 1000 requests per 15 minutes
- Auth: 50 attempts per 15 minutes
- API: 2000 requests per 15 minutes

### Production Environment
- Stricter limits for security
- General: 50 requests per 15 minutes
- Auth: 3 attempts per 15 minutes

## Response Headers

Rate limiting information is included in response headers:
- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining in current window
- `RateLimit-Reset`: Time when the rate limit window resets

## Error Responses

When rate limit is exceeded, the API returns:
- **Status Code**: 429 (Too Many Requests)
- **Response Body**:
```json
{
  "error": "Too many requests from this IP",
  "message": "Please try again after 15 minutes",
  "retryAfter": 900
}
```

## Files Structure

```
Backend/src/
├── middleware/
│   └── rateLimiter.middleware.js    # Rate limiting middleware
├── config/
│   └── rateLimiter.config.js        # Configuration settings
└── routes/
    ├── user.routes.js               # User routes with auth limiting
    ├── project.route.js             # Project routes with creation limiting
    └── issue.route.js               # Issue routes with API limiting
```

## Usage Examples

### Applying Rate Limiting to Routes

```javascript
import { authLimiter, apiLimiter } from '../middleware/rateLimiter.middleware.js';

// Authentication endpoints
router.post('/login', authLimiter, loginController);
router.post('/register', authLimiter, registerController);

// API endpoints
router.get('/projects', apiLimiter, getProjectsController);
router.post('/projects', projectCreationLimiter, createProjectController);
```

### Custom Rate Limiter

```javascript
import { createCustomLimiter } from '../middleware/rateLimiter.middleware.js';

const customLimiter = createCustomLimiter(
  60 * 1000,  // 1 minute window
  10,         // 10 requests max
  'Custom rate limit exceeded'
);

router.post('/special-endpoint', customLimiter, specialController);
```

## Monitoring and Logging

Rate limiting events are automatically logged through the existing logging system. Monitor these logs to:
- Identify potential abuse patterns
- Adjust rate limits based on usage patterns
- Track the effectiveness of rate limiting

## Best Practices

1. **Gradual Implementation**: Start with lenient limits and tighten based on usage patterns
2. **Whitelist Trusted IPs**: Consider implementing IP whitelisting for trusted sources
3. **User-Based Limiting**: Consider implementing user-based rate limiting for authenticated requests
4. **Monitoring**: Regularly monitor rate limiting metrics and adjust as needed
5. **Documentation**: Keep API documentation updated with current rate limits

## Future Enhancements

Consider implementing:
- Redis-based rate limiting for distributed systems
- User-based rate limiting (not just IP-based)
- Dynamic rate limiting based on server load
- Rate limiting bypass for premium users
- More granular rate limiting per endpoint
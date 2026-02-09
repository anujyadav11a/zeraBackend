# Error Handling Documentation

## Overview
This application implements comprehensive error handling with structured error responses, logging, and graceful error recovery.

## Error Handling Components

### 1. ApiError Class (`src/utils/apierror.js`)
- Custom error class extending native Error
- Includes status codes, error arrays, and operational flags
- Static methods for common HTTP errors (badRequest, unauthorized, etc.)

### 2. Global Error Middleware (`src/middleware/globalError.middleware.js`)
- Catches all unhandled errors in the application
- Handles different error types (MongoDB, JWT, CORS, etc.)
- Returns consistent error response format
- Includes 404 handler for undefined routes

### 3. AsyncHandler (`src/utils/asyncHandler.js`)
- Wraps async route handlers to catch errors
- Logs errors with request context
- Passes errors to global error handler

### 4. Logger (`src/utils/logger.js`)
- File-based logging with different levels (error, warn, info, debug)
- Request logging middleware
- Structured log format with timestamps and metadata

### 5. Validation Helper (`src/utils/validation.js`)
- Input validation utilities
- Throws structured ApiError instances
- Includes common validations (email, password, ObjectId, etc.)

## Error Response Format

All errors return a consistent JSON structure:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"],
  "statuscode": 400
}
```

## HTTP Status Codes Used

- **400**: Bad Request (validation errors, malformed data)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate data)
- **413**: Payload Too Large (file size limits)
- **422**: Unprocessable Entity (semantic errors)
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error (unexpected errors)
- **502**: Bad Gateway (external service errors)
- **503**: Service Unavailable (temporary issues)

## Error Types Handled

### 1. Operational Errors (Expected)
- Validation failures
- Authentication/authorization errors
- Resource not found
- Business logic violations

### 2. Programming Errors (Unexpected)
- Syntax errors
- Type errors
- Null pointer exceptions
- Database connection failures

### 3. External Errors
- Third-party API failures
- Network timeouts
- File system errors

## Logging

### Log Files
- `logs/error.log`: Error-level messages only
- `logs/combined.log`: All log levels
- `logs/debug.log`: Debug messages (development only)

### Log Levels
- **ERROR**: Application errors, exceptions
- **WARN**: Warning conditions
- **INFO**: General information, request logs
- **DEBUG**: Detailed debugging information

## Best Practices

### For Developers

1. **Use ApiError for operational errors:**
   ```javascript
   throw ApiError.badRequest("Invalid email format");
   ```

2. **Use ValidationHelper for input validation:**
   ```javascript
   ValidationHelper.validateRequired(['email', 'password'], req.body);
   ```

3. **Wrap async handlers:**
   ```javascript
   const myHandler = asyncHandler(async (req, res) => {
     // Your code here
   });
   ```

4. **Log important operations:**
   ```javascript
   logger.info('User logged in', { userId: user.id });
   ```

### Error Handling Checklist

- [ ] All async route handlers wrapped with `asyncHandler`
- [ ] Input validation using `ValidationHelper`
- [ ] Appropriate HTTP status codes
- [ ] Meaningful error messages
- [ ] Sensitive data not exposed in errors
- [ ] Errors logged with sufficient context

## Environment-Specific Behavior

### Development
- Detailed error messages and stack traces
- Debug logs enabled
- Console logging with colors

### Production
- Generic error messages for security
- No debug logs
- File logging only
- Stack traces hidden from responses

## Monitoring and Alerts

### Log Monitoring
- Monitor `logs/error.log` for application errors
- Set up alerts for high error rates
- Track error patterns and trends

### Health Check
- Endpoint: `GET /health`
- Returns server status and uptime
- Use for load balancer health checks

## Graceful Shutdown

The application handles:
- SIGTERM and SIGINT signals
- Graceful server shutdown
- Connection cleanup
- Process exit with proper codes

## Testing Error Handling

### Unit Tests
- Test error conditions in controllers
- Verify error response formats
- Test validation logic

### Integration Tests
- Test error middleware
- Verify logging functionality
- Test graceful shutdown

### Load Testing
- Test error handling under load
- Verify memory leaks in error paths
- Test error recovery mechanisms
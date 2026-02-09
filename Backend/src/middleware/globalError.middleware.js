import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error(`[${new Date().toISOString()}] Error:`, {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Handle ApiError instances
    if (err instanceof ApiError) {
        return res.status(err.statuscode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            statuscode: err.statuscode
        });
    }

    // Handle MongoDB/Mongoose errors
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errors,
            statuscode: 400
        });
    }

    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
            errors: [`Duplicate value for ${field}`],
            statuscode: 409
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
            errors: ["Token is malformed or invalid"],
            statuscode: 401
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: "Token expired",
            errors: ["Token has expired"],
            statuscode: 401
        });
    }

    // Handle CORS errors
    if (err.message === "Access denied by CORS policy") {
        return res.status(403).json({
            success: false,
            message: "CORS policy violation",
            errors: ["Origin not allowed"],
            statuscode: 403
        });
    }

    // Handle multer errors (file upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: "File too large",
            errors: ["File size exceeds the allowed limit"],
            statuscode: 413
        });
    }

    // Handle syntax errors in JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format",
            errors: ["Request body contains invalid JSON"],
            statuscode: 400
        });
    }

    // Default error for unhandled cases
    const statusCode = err.statusCode || err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message || 'Something went wrong';

    return res.status(statusCode).json({
        success: false,
        message: message,
        errors: process.env.NODE_ENV === 'production' ? [] : [err.stack],
        statuscode: statusCode
    });
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

export { globalErrorHandler, notFoundHandler };
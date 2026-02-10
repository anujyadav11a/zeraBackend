import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/apierror.js';
import { getEnvironmentConfig } from '../config/rateLimiter.config.js';

const config = getEnvironmentConfig();

// General rate limiter for all requests
export const generalLimiter = rateLimit({
    windowMs: config.GENERAL.windowMs,
    max: config.GENERAL.max,
    message: {
        error: 'Too many requests from this IP',
        message: config.GENERAL.message,
        retryAfter: Math.floor(config.GENERAL.windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        throw new ApiError(429, config.GENERAL.message);
    }
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: config.AUTH.windowMs,
    max: config.AUTH.max,
    message: {
        error: 'Too many authentication attempts',
        message: config.AUTH.message,
        retryAfter: Math.floor(config.AUTH.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res) => {
        throw new ApiError(429, config.AUTH.message);
    }
});

// Moderate rate limiter for API endpoints
export const apiLimiter = rateLimit({
    windowMs: config.API.windowMs,
    max: config.API.max,
    message: {
        error: 'Too many API requests',
        message: config.API.message,
        retryAfter: Math.floor(config.API.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, config.API.message);
    }
});

// Strict rate limiter for password change endpoints
export const passwordChangeLimiter = rateLimit({
    windowMs: config.PASSWORD_CHANGE.windowMs,
    max: config.PASSWORD_CHANGE.max,
    message: {
        error: 'Too many password change attempts',
        message: config.PASSWORD_CHANGE.message,
        retryAfter: Math.floor(config.PASSWORD_CHANGE.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, config.PASSWORD_CHANGE.message);
    }
});

// Rate limiter for project creation
export const projectCreationLimiter = rateLimit({
    windowMs: config.PROJECT_CREATION.windowMs,
    max: config.PROJECT_CREATION.max,
    message: {
        error: 'Too many project creation attempts',
        message: config.PROJECT_CREATION.message,
        retryAfter: Math.floor(config.PROJECT_CREATION.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, config.PROJECT_CREATION.message);
    }
});

// Rate limiter for issue creation
export const issueCreationLimiter = rateLimit({
    windowMs: config.ISSUE_CREATION.windowMs,
    max: config.ISSUE_CREATION.max,
    message: {
        error: 'Too many issue creation attempts',
        message: config.ISSUE_CREATION.message,
        retryAfter: Math.floor(config.ISSUE_CREATION.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, config.ISSUE_CREATION.message);
    }
});

// Rate limiter for email sending
export const emailLimiter = rateLimit({
    windowMs: config.EMAIL.windowMs,
    max: config.EMAIL.max,
    message: {
        error: 'Too many email requests',
        message: config.EMAIL.message,
        retryAfter: Math.floor(config.EMAIL.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw new ApiError(429, config.EMAIL.message);
    }
});

// Custom rate limiter factory for specific use cases
export const createCustomLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            error: 'Rate limit exceeded',
            message: message || 'Too many requests, please try again later',
            retryAfter: Math.floor(windowMs / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            throw new ApiError(429, message || 'Rate limit exceeded, please try again later');
        }
    });
};
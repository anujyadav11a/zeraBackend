// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
    // General API rate limiting
    GENERAL: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // requests per window
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    
    // Authentication endpoints (login, register)
    AUTH: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // attempts per window
        message: 'Too many authentication attempts, please try again after 15 minutes'
    },
    
    // API endpoints
    API: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200, // requests per window
        message: 'Too many API requests, please try again after 15 minutes'
    },
    
    // Password change
    PASSWORD_CHANGE: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // attempts per window
        message: 'Too many password change attempts, please try again after 1 hour'
    },
    
    // Project creation
    PROJECT_CREATION: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // projects per window
        message: 'Too many project creation attempts, please try again after 1 hour'
    },
    
    // Issue creation
    ISSUE_CREATION: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50, // issues per window
        message: 'Too many issue creation attempts, please try again after 15 minutes'
    },
    
    // Email sending
    EMAIL: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20, // emails per window
        message: 'Too many email requests, please try again after 1 hour'
    }
};

// Environment-based rate limiting adjustments
export const getEnvironmentConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'development') {
        // More lenient limits for development
        return {
            ...RATE_LIMIT_CONFIG,
            GENERAL: { ...RATE_LIMIT_CONFIG.GENERAL, max: 1000 },
            AUTH: { ...RATE_LIMIT_CONFIG.AUTH, max: 50 },
            API: { ...RATE_LIMIT_CONFIG.API, max: 2000 }
        };
    }
    
    if (env === 'production') {
        // Stricter limits for production
        return {
            ...RATE_LIMIT_CONFIG,
            GENERAL: { ...RATE_LIMIT_CONFIG.GENERAL, max: 50 },
            AUTH: { ...RATE_LIMIT_CONFIG.AUTH, max: 3 }
        };
    }
    
    return RATE_LIMIT_CONFIG;
};
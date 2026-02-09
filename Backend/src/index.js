import { ConnectDb } from "./db/db.js";
import dotenv from 'dotenv';
import app from './app.js';
import { createDefaultadmin } from "./controllers/user.controller.js";
import { logger } from "./utils/logger.js";

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 2000;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack
    });
    console.error('Uncaught Exception! Shutting down...');
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', {
        reason: reason,
        promise: promise
    });
    console.error('Unhandled Rejection! Shutting down...');
    process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = (server) => {
    return (signal) => {
        logger.info(`Received ${signal}. Starting graceful shutdown...`);
        
        server.close((err) => {
            if (err) {
                logger.error('Error during server shutdown:', { error: err.message });
                process.exit(1);
            }
            
            logger.info('Server closed successfully');
            process.exit(0);
        });
        
        // Force shutdown after 10 seconds
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    };
};

ConnectDb()
    .then(() => {
        const server = app.listen(PORT, async () => {
            try {
                await createDefaultadmin();
                logger.info(`Server started successfully on port ${PORT}`, {
                    port: PORT,
                    environment: process.env.NODE_ENV || 'development',
                    nodeVersion: process.version
                });
                console.log(`🚀 Server is running on port ${PORT}`);
            } catch (error) {
                logger.error('Error during server initialization:', {
                    error: error.message,
                    stack: error.stack
                });
                console.error("Error during server initialization:", error.message);
            }
        });

        // Setup graceful shutdown handlers
        process.on('SIGTERM', gracefulShutdown(server));
        process.on('SIGINT', gracefulShutdown(server));

        // Handle server errors
        server.on('error', (error) => {
            logger.error('Server error:', {
                error: error.message,
                code: error.code,
                stack: error.stack
            });
            
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use`);
                process.exit(1);
            }
        });
    })
    .catch((error) => {
        logger.error('Database connection failed:', {
            error: error.message,
            stack: error.stack
        });
        console.error("❌ Error while connecting to database:", error.message);
        process.exit(1);
    });
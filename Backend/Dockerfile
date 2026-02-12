# Stage 1: Build stage
FROM node:20-alpine AS builder

# Create app directory and user
WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production stage
FROM node:20-alpine

# Set environment
ENV NODE_ENV=production

WORKDIR /app

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . ./

# Create necessary directories with proper permissions
RUN mkdir -p logs public/temp && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (using environment variable with fallback)
EXPOSE ${PORT:-2000}

# Health check with dynamic port
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const port = process.env.PORT || 2000; require('http').get(\`http://localhost:\${port}\`, (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start the application directly
CMD ["node", "src/index.js"]
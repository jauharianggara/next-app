# Multi-stage build for Express.js backend
FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development dependencies
FROM base AS dev-deps
COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY --chown=backend:nodejs . .

# Create uploads directory
RUN mkdir -p uploads && chown backend:nodejs uploads

# Switch to non-root user
USER backend

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 8080, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); \
      else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => process.exit(1)); \
    req.end();"

# Start application
CMD ["node", "server.js"]
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY utils/ ./utils/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mpesa-service -u 1001

# Change ownership
RUN chown -R mpesa-service:nodejs /app

USER mpesa-service

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Start the application
CMD ["node", "index.js"]
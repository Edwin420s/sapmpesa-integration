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
RUN adduser -S sap-service -u 1001

# Change ownership
RUN chown -R sap-service:nodejs /app

USER sap-service

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3004/health || exit 1

# Start the application
CMD ["node", "index.js"]
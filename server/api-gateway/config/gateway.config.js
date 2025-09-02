require('dotenv').config();

module.exports = {
  port: process.env.GATEWAY_PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
  },
  
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    mpesa: process.env.MPESA_SERVICE_URL || 'http://localhost:3002',
    transaction: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3003',
    sap: process.env.SAP_SERVICE_URL || 'http://localhost:3004',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    algorithm: 'HS256',
    expiresIn: '24h'
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 1000
  }
};
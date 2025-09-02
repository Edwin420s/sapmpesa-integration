const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/gateway.config');
const healthRoutes = require('./routes/health');
const docsRoutes = require('./routes/docs');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://sandbox.safaricom.co.ke", "https://api.safaricom.co.ke"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Logging
app.use(requestLogger);

// Health check and documentation routes
app.use('/health', healthRoutes);
app.use('/docs', docsRoutes);

// Auth routes (no authentication required)
app.use('/auth', createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: { '^/auth': '' },
  onError: (err, req, res) => {
    console.error('Auth service error:', err);
    res.status(502).json({
      success: false,
      message: 'Authentication service unavailable'
    });
  }
}));

// Authenticate all other routes
app.use(authMiddleware);

// Service routes with error handling
const createServiceProxy = (path, target) => {
  return createProxyMiddleware(path, {
    target,
    changeOrigin: true,
    pathRewrite: { [`^${path}`]: '' },
    onError: (err, req, res) => {
      console.error(`${path} service error:`, err);
      res.status(502).json({
        success: false,
        message: `${path.replace('/', '')} service unavailable`
      });
    }
  });
};

app.use('/mpesa', createServiceProxy('/mpesa', config.services.mpesa));
app.use('/transactions', createServiceProxy('/transactions', config.services.transaction));
app.use('/sap', createServiceProxy('/sap', config.services.sap));
app.use('/notifications', createServiceProxy('/notifications', config.services.notification));
app.use('/dashboard', createServiceProxy('/dashboard', config.services.transaction));

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SAP M-Pesa Integration API Gateway',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found. Please check the API documentation at /docs'
  });
});

// Error handling
app.use(errorHandler);

const PORT = config.port || 3000;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Documentation: http://localhost:${PORT}/docs`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
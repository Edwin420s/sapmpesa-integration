const express = require('express');
const healthRoutes = require('./health');
const docsRoutes = require('./docs');

const router = express.Router();

// Health routes
router.use('/health', healthRoutes);

// API documentation routes
router.use('/docs', docsRoutes);

// Default route
router.get('/', (req, res) => {
  res.json({
    message: 'SAP M-Pesa Integration API Gateway',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health'
  });
});

// 404 handler for API gateway specific routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found. Please check the API documentation at /docs'
  });
});

module.exports = router;
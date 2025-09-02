const express = require('express');
const healthCheck = require('../../shared/utils/healthCheck');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    const healthStatus = await healthCheck.checkAllServices();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      services: healthStatus.services
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

router.get('/health/detailed', async (req, res) => {
  try {
    const healthStatus = await healthCheck.checkAllServices();
    
    // Log system health
    await healthCheck.logSystemHealth(
      'api-gateway',
      healthStatus.status,
      null,
      null,
      healthStatus
    );
    
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

router.get('/health/history/:serviceName', async (req, res) => {
  try {
    const { serviceName } = req.params;
    const hours = parseInt(req.query.hours) || 24;
    
    const history = await healthCheck.getSystemHealthHistory(serviceName, hours);
    
    res.status(200).json({
      service: serviceName,
      history: history
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
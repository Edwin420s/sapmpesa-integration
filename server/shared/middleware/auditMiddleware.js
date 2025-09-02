const auditLogger = require('../utils/auditLogger');

const auditMiddleware = (serviceName) => {
  return async (req, res, next) => {
    const start = Date.now();
    
    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    let responseBody = null;
    
    // Override response methods to capture response body
    res.send = function(body) {
      responseBody = body;
      return originalSend.apply(this, arguments);
    };
    
    res.json = function(body) {
      responseBody = body;
      return originalJson.apply(this, arguments);
    };
    
    res.on('finish', async () => {
      const duration = Date.now() - start;
      const userId = req.user?.userId || 'anonymous';
      
      await auditLogger.logApiCall(
        serviceName,
        req.path,
        req.method,
        res.statusCode,
        duration,
        userId,
        req.ip,
        req.get('User-Agent'),
        req.body,
        responseBody,
        res.statusCode >= 400 ? responseBody?.message || 'Unknown error' : null
      );
      
      // Update performance metrics
      await auditLogger.updatePerformanceMetrics(
        serviceName,
        req.path,
        duration,
        res.statusCode >= 400
      );
    });
    
    next();
  };
};

const userActivityMiddleware = (action, resourceType = null) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode < 400 && req.user) {
        let resourceId = null;
        let details = null;
        
        // Extract resource ID from different sources
        if (req.params.id) {
          resourceId = req.params.id;
        } else if (req.body.id) {
          resourceId = req.body.id;
        }
        
        // Capture relevant details based on action
        if (action === 'LOGIN') {
          details = { success: true };
        } else if (action === 'CREATE' || action === 'UPDATE') {
          details = { data: req.body };
        }
        
        await auditLogger.logUserActivity(
          req.user.userId,
          action,
          resourceType,
          resourceId,
          details,
          req.ip,
          req.get('User-Agent')
        );
      }
    });
    
    next();
  };
};

module.exports = {
  auditMiddleware,
  userActivityMiddleware
};
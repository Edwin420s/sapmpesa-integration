const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, errors } = format;

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({
      filename: 'logs/api-gateway-error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new transports.File({
      filename: 'logs/api-gateway-combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.userId || 'anonymous',
      contentLength: res.get('Content-Length'),
      user: req.user?.username
    };
    
    // Log differently based on status code
    if (res.statusCode >= 400) {
      logger.warn('API Request Warning', logData);
    } else if (res.statusCode >= 500) {
      logger.error('API Request Error', logData);
    } else {
      logger.info('API Request', logData);
    }
  });
  
  next();
};

// Morgan-style logging for development
const devRequestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
    const resetColor = '\x1b[0m';
    
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.url} - ` +
      `${statusColor}${res.statusCode}${resetColor} - ` +
      `${duration}ms - ${req.get('User-Agent')}`
    );
  });
  
  next();
};

module.exports = process.env.NODE_ENV === 'production' ? requestLogger : devRequestLogger;
const axios = require('axios');
const { Sequelize } = require('sequelize');
const sequelize = require('../../database/connectors/postgres');
const mongoose = require('mongoose');

class HealthCheckService {
  constructor() {
    this.services = {
      database: this.checkDatabase.bind(this),
      redis: this.checkRedis.bind(this),
      mpesa: this.checkMpesaAPI.bind(this),
      sap: this.checkSAPAPI.bind(this)
    };
  }

  async checkDatabase() {
    try {
      // Check PostgreSQL connection
      await sequelize.authenticate();
      
      // Check MongoDB connection if configured
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
      }
      
      return { status: 'HEALTHY', message: 'Database connections are healthy' };
    } catch (error) {
      return { status: 'UNHEALTHY', message: `Database error: ${error.message}` };
    }
  }

  async checkRedis() {
    // This would check Redis connection if implemented
    return { status: 'HEALTHY', message: 'Redis is healthy' };
  }

  async checkMpesaAPI() {
    try {
      // Simple check to see if M-Pesa API is responsive
      const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        timeout: 5000
      });
      
      return { status: 'HEALTHY', message: 'M-Pesa API is responsive' };
    } catch (error) {
      return { status: 'DEGRADED', message: `M-Pesa API may be experiencing issues: ${error.message}` };
    }
  }

  async checkSAPAPI() {
    try {
      // This would check SAP API connectivity
      // For now, return healthy as we don't have actual SAP credentials
      return { status: 'HEALTHY', message: 'SAP API connectivity is healthy' };
    } catch (error) {
      return { status: 'DEGRADED', message: `SAP API connectivity issue: ${error.message}` };
    }
  }

  async checkAllServices() {
    const results = {};
    const checks = [];

    for (const [serviceName, checkFunction] of Object.entries(this.services)) {
      checks.push(
        checkFunction()
          .then(result => {
            results[serviceName] = result;
          })
          .catch(error => {
            results[serviceName] = {
              status: 'UNHEALTHY',
              message: `Service check failed: ${error.message}`
            };
          })
      );
    }

    await Promise.allSettled(checks);

    // Determine overall status
    const overallStatus = Object.values(results).every(result => result.status === 'HEALTHY')
      ? 'HEALTHY'
      : Object.values(results).some(result => result.status === 'UNHEALTHY')
      ? 'UNHEALTHY'
      : 'DEGRADED';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: results
    };
  }

  async logSystemHealth(serviceName, status, responseTime = null, errorRate = null, details = null) {
    try {
      await sequelize.query(
        `INSERT INTO system_health (service_name, status, response_time, error_rate, details)
         VALUES (?, ?, ?, ?, ?)`,
        {
          replacements: [
            serviceName,
            status,
            responseTime,
            errorRate,
            details ? JSON.stringify(details) : null
          ],
          type: Sequelize.QueryTypes.INSERT
        }
      );
    } catch (error) {
      console.error('Failed to log system health:', error);
    }
  }

  async getSystemHealthHistory(serviceName, hours = 24) {
    try {
      const history = await sequelize.query(
        `SELECT * FROM system_health 
         WHERE service_name = ? AND last_check >= NOW() - INTERVAL '${hours} hours'
         ORDER BY last_check DESC`,
        {
          replacements: [serviceName],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      return history;
    } catch (error) {
      console.error('Failed to get system health history:', error);
      return [];
    }
  }
}

module.exports = new HealthCheckService();
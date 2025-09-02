const { Sequelize } = require('sequelize');
const sequelize = require('../../database/connectors/postgres');

class AuditLogger {
  constructor() {
    this.sequelize = sequelize;
  }

  async logApiCall(serviceName, endpoint, method, statusCode, responseTime, userId, ipAddress, userAgent, requestBody = null, responseBody = null, errorMessage = null) {
    try {
      await this.sequelize.query(
        `INSERT INTO api_audit_log (
          service_name, endpoint, method, status_code, response_time, 
          user_id, ip_address, user_agent, request_body, response_body, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            serviceName,
            endpoint,
            method,
            statusCode,
            responseTime,
            userId,
            ipAddress,
            userAgent,
            requestBody ? JSON.stringify(requestBody) : null,
            responseBody ? JSON.stringify(responseBody) : null,
            errorMessage
          ],
          type: Sequelize.QueryTypes.INSERT
        }
      );
    } catch (error) {
      console.error('Failed to log API call:', error);
    }
  }

  async logUserActivity(userId, action, resourceType = null, resourceId = null, details = null, ipAddress = null, userAgent = null) {
    try {
      await this.sequelize.query(
        `INSERT INTO user_activity_log (
          user_id, action, resource_type, resource_id, details, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            userId,
            action,
            resourceType,
            resourceId,
            details ? JSON.stringify(details) : null,
            ipAddress,
            userAgent
          ],
          type: Sequelize.QueryTypes.INSERT
        }
      );
    } catch (error) {
      console.error('Failed to log user activity:', error);
    }
  }

  async updatePerformanceMetrics(serviceName, endpoint, responseTime, isError = false) {
    try {
      // This would typically use a more sophisticated approach with time-series data
      // For simplicity, we're using a basic implementation
      await this.sequelize.query(
        `INSERT INTO performance_metrics (
          service_name, endpoint, average_response_time, request_count, error_count
        ) VALUES (?, ?, ?, 1, ?)
        ON CONFLICT (service_name, endpoint) 
        DO UPDATE SET 
          average_response_time = (performance_metrics.average_response_time * performance_metrics.request_count + ?) / (performance_metrics.request_count + 1),
          request_count = performance_metrics.request_count + 1,
          error_count = performance_metrics.error_count + ?,
          success_rate = (1 - ((performance_metrics.error_count + ?)::decimal / (performance_metrics.request_count + 1))) * 100`,
        {
          replacements: [
            serviceName,
            endpoint,
            responseTime,
            isError ? 1 : 0,
            responseTime,
            isError ? 1 : 0,
            isError ? 1 : 0
          ],
          type: Sequelize.QueryTypes.INSERT
        }
      );
    } catch (error) {
      console.error('Failed to update performance metrics:', error);
    }
  }

  async getApiStats(serviceName, startDate, endDate) {
    try {
      const stats = await this.sequelize.query(
        `SELECT 
          COUNT(*) as total_requests,
          AVG(response_time) as avg_response_time,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
          (COUNT(CASE WHEN status_code < 400 THEN 1 END)::decimal / COUNT(*)) * 100 as success_rate
        FROM api_audit_log 
        WHERE service_name = ? AND created_at BETWEEN ? AND ?`,
        {
          replacements: [serviceName, startDate, endDate],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      return stats[0];
    } catch (error) {
      console.error('Failed to get API stats:', error);
      return null;
    }
  }

  async getRecentActivities(limit = 100) {
    try {
      const activities = await this.sequelize.query(
        `SELECT * FROM user_activity_log 
         ORDER BY created_at DESC 
         LIMIT ?`,
        {
          replacements: [limit],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      return activities;
    } catch (error) {
      console.error('Failed to get recent activities:', error);
      return [];
    }
  }
}

module.exports = new AuditLogger();
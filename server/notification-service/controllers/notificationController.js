const Notification = require('../models/Notification');
const emailService = require('../utils/emailService');
const smsService = require('../utils/smsService');

class NotificationController {
  async createNotification(req, res) {
    try {
      const {
        channel,
        recipient,
        subject,
        message,
        priority = 'normal',
        data = {}
      } = req.body;

      // Create notification record
      const notification = new Notification({
        channel,
        recipient,
        subject,
        message,
        priority,
        data,
        status: 'PENDING'
      });

      await notification.save();

      // Send notification based on channel
      let result;
      switch (channel) {
        case 'email':
          result = await emailService.sendEmail(recipient, subject, 'transaction', {
            message,
            transaction: data.transaction
          });
          break;

        case 'sms':
          result = await smsService.sendTransactionSMS(recipient, data.transaction);
          break;

        case 'push':
          // Push notification would be handled differently
          result = { success: true, message: 'Push notification queued' };
          break;

        default:
          result = { success: false, error: 'Unsupported channel' };
      }

      // Update notification status
      if (result.success) {
        await Notification.findByIdAndUpdate(notification._id, {
          status: 'SENT',
          sent_at: new Date(),
          provider_message_id: result.messageId
        });
      } else {
        await Notification.findByIdAndUpdate(notification._id, {
          status: 'FAILED',
          error_message: result.error
        });
      }

      res.status(202).json({
        success: true,
        notificationId: notification._id,
        message: 'Notification queued for delivery'
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create notification' 
      });
    }
  }

  async getNotifications(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        channel,
        status,
        recipient,
        start_date,
        end_date
      } = req.query;

      const filter = {};
      if (channel) filter.channel = channel;
      if (status) filter.status = status;
      if (recipient) filter.recipient = recipient;

      if (start_date || end_date) {
        filter.created_at = {};
        if (start_date) filter.created_at.$gte = new Date(start_date);
        if (end_date) filter.created_at.$lte = new Date(end_date);
      }

      const notifications = await Notification.find(filter)
        .sort({ created_at: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Notification.countDocuments(filter);

      res.json({
        success: true,
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async getNotificationById(req, res) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findById(id);
      
      if (!notification) {
        return res.status(404).json({ 
          success: false, 
          message: 'Notification not found' 
        });
      }

      res.json({
        success: true,
        notification
      });
    } catch (error) {
      console.error('Get notification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async retryNotification(req, res) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findById(id);
      
      if (!notification) {
        return res.status(404).json({ 
          success: false, 
          message: 'Notification not found' 
        });
      }

      if (notification.status !== 'FAILED') {
        return res.status(400).json({ 
          success: false, 
          message: 'Only failed notifications can be retried' 
        });
      }

      // Retry sending based on channel
      let result;
      switch (notification.channel) {
        case 'email':
          result = await emailService.sendEmail(
            notification.recipient,
            notification.subject,
            'transaction',
            { message: notification.message, ...notification.data }
          );
          break;

        case 'sms':
          result = await smsService.sendSMS(
            notification.recipient,
            notification.message
          );
          break;

        default:
          result = { success: false, error: 'Unsupported channel for retry' };
      }

      // Update notification
      await Notification.findByIdAndUpdate(id, {
        status: result.success ? 'SENT' : 'FAILED',
        sent_at: result.success ? new Date() : undefined,
        error_message: result.error,
        retry_count: (notification.retry_count || 0) + 1,
        provider_message_id: result.messageId
      });

      res.json({
        success: result.success,
        message: result.success ? 'Notification sent successfully' : 'Notification failed',
        error: result.error
      });
    } catch (error) {
      console.error('Retry notification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async getStats(req, res) {
    try {
      const { days = 30 } = req.query;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const stats = await Notification.aggregate([
        {
          $match: {
            created_at: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              channel: '$channel',
              status: '$status'
            },
            count: { $sum: 1 }
          }
        }
      ]);

      const total = await Notification.countDocuments({
        created_at: { $gte: startDate }
      });

      const successful = await Notification.countDocuments({
        created_at: { $gte: startDate },
        status: 'SENT'
      });

      const failureRate = total > 0 ? ((total - successful) / total) * 100 : 0;

      res.json({
        success: true,
        stats: {
          period: `${days} days`,
          total_notifications: total,
          successful_notifications: successful,
          failure_rate: failureRate.toFixed(2),
          breakdown: stats
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async sendBulkNotifications(req, res) {
    try {
      const { notifications } = req.body;

      if (!Array.isArray(notifications) || notifications.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Notifications array is required' 
        });
      }

      const results = [];
      
      for (const notificationData of notifications) {
        try {
          const notification = new Notification({
            ...notificationData,
            status: 'PENDING'
          });

          await notification.save();
          results.push({ success: true, notificationId: notification._id });
        } catch (error) {
          results.push({ success: false, error: error.message });
        }
      }

      res.json({
        success: true,
        results,
        message: 'Bulk notifications queued'
      });
    } catch (error) {
      console.error('Bulk notifications error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process bulk notifications' 
      });
    }
  }
}

module.exports = new NotificationController();
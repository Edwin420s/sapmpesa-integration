const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const webpush = require('web-push');
const Notification = require('./models/Notification');
const connectDB = require('../database/connectors/mongo');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Notification providers configuration
const config = {
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_PHONE_NUMBER
  },
  push: {
    vapid: {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
      subject: process.env.VAPID_SUBJECT
    }
  }
};

// Initialize providers
const emailTransporter = nodemailer.createTransport(config.email);
const smsClient = twilio(config.sms.accountSid, config.sms.authToken);

// Initialize web push
webpush.setVapidDetails(
  config.push.vapid.subject,
  config.push.vapid.publicKey,
  config.push.vapid.privateKey
);

class NotificationService {
  async sendEmail(notification) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: notification.recipient,
        subject: notification.subject,
        html: notification.message
      };

      const result = await emailTransporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendSMS(notification) {
    try {
      const result = await smsClient.messages.create({
        body: notification.message,
        from: config.sms.from,
        to: notification.recipient
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPush(notification) {
    try {
      // This would typically fetch subscription details from database
      // For now, we'll assume subscription is provided in notification data
      const subscription = notification.data?.subscription;
      
      if (!subscription) {
        return { success: false, error: 'Push subscription required' };
      }

      const payload = JSON.stringify({
        title: notification.subject,
        body: notification.message,
        icon: '/assets/icons/icon-192x192.png',
        data: { url: notification.data?.url }
      });

      await webpush.sendNotification(subscription, payload);
      return { success: true };
    } catch (error) {
      console.error('Push notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendNotification(notification) {
    let result;

    switch (notification.channel) {
      case 'email':
        result = await this.sendEmail(notification);
        break;
      case 'sms':
        result = await this.sendSMS(notification);
        break;
      case 'push':
        result = await this.sendPush(notification);
        break;
      default:
        result = { success: false, error: 'Unsupported channel' };
    }

    // Update notification status
    notification.status = result.success ? 'SENT' : 'FAILED';
    notification.sent_at = new Date();
    notification.error_message = result.error;
    notification.provider_message_id = result.messageId;

    await notification.save();

    return result;
  }
}

const notificationService = new NotificationService();

// Routes
app.post('/notifications', async (req, res) => {
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

    // Send notification (async)
    notificationService.sendNotification(notification).catch(console.error);

    res.status(202).json({
      success: true,
      notificationId: notification._id,
      message: 'Notification queued for delivery'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

app.get('/notifications', async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/notifications/:id/retry', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.status !== 'FAILED') {
      return res.status(400).json({ error: 'Only failed notifications can be retried' });
    }

    // Reset notification for retry
    notification.status = 'PENDING';
    notification.retry_count = (notification.retry_count || 0) + 1;
    await notification.save();

    // Retry sending
    const result = await notificationService.sendNotification(notification);

    res.json({
      success: result.success,
      message: result.success ? 'Notification sent successfully' : 'Notification failed',
      error: result.error
    });
  } catch (error) {
    console.error('Retry notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/stats', async (req, res) => {
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
      period: `${days} days`,
      total_notifications: total,
      successful_notifications: successful,
      failure_rate: failureRate.toFixed(2),
      breakdown: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});

module.exports = app;
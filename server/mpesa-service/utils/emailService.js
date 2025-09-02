const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.templates = this.loadTemplates();
  }

  loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/email');
    const templates = {};

    if (fs.existsSync(templatesDir)) {
      const files = fs.readdirSync(templatesDir);
      files.forEach(file => {
        if (file.endsWith('.hbs')) {
          const templateName = path.basename(file, '.hbs');
          const templateContent = fs.readFileSync(
            path.join(templatesDir, file),
            'utf8'
          );
          templates[templateName] = handlebars.compile(templateContent);
        }
      });
    }

    return templates;
  }

  async sendEmail(to, subject, templateName, data = {}) {
    try {
      let html;
      
      if (this.templates[templateName]) {
        html = this.templates[templateName](data);
      } else {
        // Fallback to simple text
        html = this.createBasicEmail(data.message || subject);
      }

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
        ...(data.attachments && { attachments: data.attachments })
      };

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  createBasicEmail(message) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a237e; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { background: #eee; padding: 10px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SAP M-Pesa Integration</h1>
          </div>
          <div class="content">
            ${message}
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendTransactionNotification(transaction, recipient) {
    const subject = `Transaction ${transaction.status}: ${transaction.mpesa_receipt}`;
    
    const data = {
      transaction,
      subject,
      date: new Date().toLocaleDateString()
    };

    return this.sendEmail(recipient, subject, 'transaction', data);
  }

  async sendDailyReport(recipient, reportData) {
    const subject = `Daily Reconciliation Report - ${new Date().toLocaleDateString()}`;
    
    return this.sendEmail(recipient, subject, 'daily-report', reportData);
  }

  async sendErrorAlert(recipient, errorDetails) {
    const subject = 'System Error Alert';
    
    return this.sendEmail(recipient, subject, 'error-alert', errorDetails);
  }

  async sendWelcomeEmail(recipient, userData) {
    const subject = 'Welcome to SAP M-Pesa Integration';
    
    return this.sendEmail(recipient, subject, 'welcome', userData);
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection verification failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
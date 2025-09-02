const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSMS(to, message) {
    try {
      // Format phone number for Twilio
      const formattedTo = this.formatPhoneNumber(to);
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedTo
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  formatPhoneNumber(phone) {
    // Remove any non-digit characters
    let digits = phone.replace(/\D/g, '');
    
    // Handle Kenyan numbers
    if (digits.startsWith('0')) {
      digits = '254' + digits.substring(1);
    } else if (digits.startsWith('7') || digits.startsWith('1')) {
      digits = '254' + digits;
    }
    
    // Ensure it starts with +
    return '+' + digits;
  }

  async sendTransactionSMS(phone, transaction) {
    const message = this.createTransactionMessage(transaction);
    return this.sendSMS(phone, message);
  }

  createTransactionMessage(transaction) {
    switch (transaction.status) {
      case 'SUCCESS':
        return `Payment of KES ${transaction.amount} received. Ref: ${transaction.mpesa_receipt}. Thank you!`;
      
      case 'FAILED':
        return `Payment of KES ${transaction.amount} failed. Reason: ${transaction.result_desc}.`;
      
      case 'PENDING':
        return `Payment of KES ${transaction.amount} is being processed. We'll notify you once completed.`;
      
      default:
        return `Transaction ${transaction.checkout_request_id} status: ${transaction.status}`;
    }
  }

  async sendOTP(phone, otp) {
    const message = `Your verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendSMS(phone, message);
  }

  async sendAlert(phone, alertMessage) {
    const message = `ALERT: ${alertMessage}`;
    return this.sendSMS(phone, message);
  }

  async getMessageStatus(messageId) {
    try {
      const message = await this.client.messages(messageId).fetch();
      return {
        status: message.status,
        sent: message.dateSent,
        direction: message.direction
      };
    } catch (error) {
      console.error('Error fetching message status:', error);
      throw error;
    }
  }

  async getUsage(startDate, endDate) {
    try {
      const messages = await this.client.messages.list({
        dateSentAfter: new Date(startDate),
        dateSentBefore: new Date(endDate)
      });

      return {
        total: messages.length,
        sent: messages.filter(m => m.status === 'sent').length,
        delivered: messages.filter(m => m.status === 'delivered').length,
        failed: messages.filter(m => m.status === 'failed').length
      };
    } catch (error) {
      console.error('Error fetching SMS usage:', error);
      throw error;
    }
  }
}

module.exports = new SMSService();
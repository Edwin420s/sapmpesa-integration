const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  channel: {
    type: String,
    required: true,
    enum: ['email', 'sms', 'push', 'in-app']
  },
  recipient: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'FAILED', 'DELIVERED', 'READ'],
    default: 'PENDING'
  },
  retry_count: {
    type: Number,
    default: 0
  },
  error_message: {
    type: String
  },
  provider_message_id: {
    type: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sent_at: {
    type: Date
  },
  read_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ channel: 1, status: 1 });
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ created_at: -1 });
notificationSchema.index({ status: 1, priority: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
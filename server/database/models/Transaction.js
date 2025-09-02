const { DataTypes } = require('sequelize');
const sequelize = require('../connectors/postgres');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  checkout_request_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  merchant_request_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  conversation_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  originator_conversation_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mpesa_receipt: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account_reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transaction_type: {
    type: DataTypes.ENUM('STK_PUSH', 'B2C', 'C2B', 'B2B', 'REVERSAL'),
    allowNull: false
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  result_code: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  result_desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  sap_reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sap_sync_status: {
    type: DataTypes.ENUM('PENDING', 'SYNCED', 'FAILED'),
    defaultValue: 'PENDING'
  },
  request_payload: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  response_payload: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  callback_payload: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  retry_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'mpesa_transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['checkout_request_id']
    },
    {
      fields: ['mpesa_receipt']
    },
    {
      fields: ['phone_number']
    },
    {
      fields: ['status']
    },
    {
      fields: ['transaction_type']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Transaction;
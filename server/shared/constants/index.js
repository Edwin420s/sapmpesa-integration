const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

const TRANSACTION_TYPES = {
  STK_PUSH: 'STK_PUSH',
  B2C: 'B2C',
  C2B: 'C2B',
  B2B: 'B2B',
  REVERSAL: 'REVERSAL'
};

const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in-app'
};

const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer'
};

const SAP_SYNC_STATUS = {
  PENDING: 'PENDING',
  SYNCED: 'SYNCED',
  FAILED: 'FAILED'
};

const MPESA_ERROR_CODES = {
  0: 'Success',
  1: 'Insufficient Funds',
  2: 'Less Than Minimum Transaction Value',
  3: 'More Than Maximum Transaction Value',
  4: 'Would Exceed Daily Transfer Limit',
  5: 'Would Exceed Minimum Balance',
  6: 'Unresolved Primary Party',
  7: 'Unresolved Receiver Party',
  8: 'Would Exceed Maximum Balance',
  11: 'Debit Account Invalid',
  12: 'Credit Account Invalid',
  13: 'Unresolved Debit Account',
  14: 'Unresolved Credit Account',
  15: 'Duplicate Detected',
  17: 'Internal Failure',
  20: 'Unresolved Initiator',
  26: 'Traffic blocking condition in place'
};

module.exports = {
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  NOTIFICATION_CHANNELS,
  USER_ROLES,
  SAP_SYNC_STATUS,
  MPESA_ERROR_CODES
};
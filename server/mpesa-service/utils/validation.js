const { body } = require('express-validator');

const stkPushValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number'),
  
  body('phone')
    .matches(/^254[17]\d{8}$/)
    .withMessage('Phone number must be in format 2547XXXXXXXX'),
  
  body('account_reference')
    .isLength({ min: 1, max: 12 })
    .withMessage('Account reference must be between 1 and 12 characters'),
  
  body('transaction_desc')
    .isLength({ min: 1, max: 13 })
    .withMessage('Transaction description must be between 1 and 13 characters'),
  
  body('callback_url')
    .optional()
    .isURL()
    .withMessage('Callback URL must be a valid URL')
];

const b2cValidation = [
  body('amount')
    .isFloat({ min: 1, max: 70000 })
    .withMessage('Amount must be between 1 and 70,000'),
  
  body('phone')
    .matches(/^254[17]\d{8}$/)
    .withMessage('Phone number must be in format 2547XXXXXXXX'),
  
  body('remarks')
    .isLength({ min: 1, max: 100 })
    .withMessage('Remarks must be between 1 and 100 characters'),
  
  body('occasion')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Occasion must be less than 100 characters')
];

const transactionStatusValidation = [
  body('transaction_id')
    .notEmpty()
    .withMessage('Transaction ID is required'),
  
  body('identifier_type')
    .isIn(['1', '2', '4'])
    .withMessage('Identifier type must be 1, 2, or 4')
];

module.exports = {
  stkPushValidation,
  b2cValidation,
  transactionStatusValidation
};
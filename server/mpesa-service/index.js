const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { stkPushValidation, b2cValidation } = require('./utils/validation');
const mpesaAPI = require('./utils/mpesaAPI');
const security = require('./utils/security');
const Transaction = require('../database/models/Transaction');
const connectDB = require('../database/connectors/postgres');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.post('/stk-push', stkPushValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      amount, 
      phone, 
      account_reference, 
      transaction_desc,
      callback_url 
    } = req.body;

    // Format phone number (ensure it starts with 254)
    const formattedPhone = phone.startsWith('254') ? phone : `254${phone.substring(1)}`;

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = security.generatePassword(timestamp);

    // STK Push request
    const stkResponse = await mpesaAPI.stkPush({
      BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_BUSINESS_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callback_url || process.env.MPESA_CALLBACK_URL,
      AccountReference: account_reference,
      TransactionDesc: transaction_desc
    });

    // Save transaction to database
    const transaction = new Transaction({
      checkout_request_id: stkResponse.CheckoutRequestID,
      merchant_request_id: stkResponse.MerchantRequestID,
      amount: amount,
      phone_number: formattedPhone,
      account_reference: account_reference,
      transaction_type: 'STK_PUSH',
      status: 'PENDING',
      request_payload: req.body,
      response_payload: stkResponse
    });

    await transaction.save();

    res.json({
      success: true,
      checkout_request_id: stkResponse.CheckoutRequestID,
      merchant_request_id: stkResponse.MerchantRequestID,
      response_description: stkResponse.ResponseDescription
    });
  } catch (error) {
    console.error('STK Push error:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.errorMessage || 'STK Push failed'
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.post('/b2c', b2cValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      amount, 
      phone, 
      remarks,
      occasion 
    } = req.body;

    // Format phone number
    const formattedPhone = phone.startsWith('254') ? phone : `254${phone.substring(1)}`;

    // B2C request
    const b2cResponse = await mpesaAPI.b2cPayment({
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: security.getSecurityCredential(),
      CommandID: 'BusinessPayment',
      Amount: amount,
      PartyA: process.env.MPESA_BUSINESS_SHORTCODE,
      PartyB: formattedPhone,
      Remarks: remarks,
      QueueTimeOutURL: process.env.MPESA_QUEUE_TIMEOUT_URL,
      ResultURL: process.env.MPESA_RESULT_URL,
      Occasion: occasion
    });

    // Save transaction
    const transaction = new Transaction({
      conversation_id: b2cResponse.ConversationID,
      originator_conversation_id: b2cResponse.OriginatorConversationID,
      amount: amount,
      phone_number: formattedPhone,
      transaction_type: 'B2C',
      status: 'PENDING',
      request_payload: req.body,
      response_payload: b2cResponse
    });

    await transaction.save();

    res.json({
      success: true,
      conversation_id: b2cResponse.ConversationID,
      originator_conversation_id: b2cResponse.OriginatorConversationID,
      response_description: b2cResponse.ResponseDescription
    });
  } catch (error) {
    console.error('B2C error:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.errorMessage || 'B2C payment failed'
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.post('/callback', async (req, res) => {
  try {
    console.log('M-Pesa callback received:', JSON.stringify(req.body, null, 2));
    
    // Validate callback (basic validation)
    if (!req.body.Body || !req.body.Body.stkCallback) {
      return res.status(400).json({ error: 'Invalid callback format' });
    }

    const callback = req.body.Body.stkCallback;
    const checkoutRequestID = callback.CheckoutRequestID;
    
    // Find transaction
    const transaction = await Transaction.findOne({ 
      where: { checkout_request_id: checkoutRequestID } 
    });

    if (!transaction) {
      console.warn('Transaction not found for checkout request:', checkoutRequestID);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update transaction based on callback
    if (callback.ResultCode === 0) {
      // Success
      const item = callback.CallbackMetadata.Item;
      const amount = item.find(i => i.Name === 'Amount')?.Value;
      const mpesaReceipt = item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const phone = item.find(i => i.Name === 'PhoneNumber')?.Value;
      const transactionDate = item.find(i => i.Name === 'TransactionDate')?.Value;

      transaction.status = 'SUCCESS';
      transaction.mpesa_receipt = mpesaReceipt;
      transaction.transaction_date = transactionDate;
      transaction.result_code = callback.ResultCode;
      transaction.result_desc = callback.ResultDesc;
      transaction.callback_payload = req.body;

      // TODO: Trigger SAP update via message queue or direct API call
      
    } else {
      // Failure
      transaction.status = 'FAILED';
      transaction.result_code = callback.ResultCode;
      transaction.result_desc = callback.ResultDesc;
      transaction.callback_payload = req.body;
    }

    await transaction.save();

    // Acknowledge callback
    res.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully'
    });
  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({ 
      ResultCode: 1, 
      ResultDesc: 'Error processing callback' 
    });
  }
});

app.get('/transaction-status/:checkoutRequestId', async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    const transaction = await Transaction.findOne({ 
      where: { checkout_request_id: checkoutRequestId } 
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      checkout_request_id: transaction.checkout_request_id,
      status: transaction.status,
      amount: transaction.amount,
      phone_number: transaction.phone_number,
      mpesa_receipt: transaction.mpesa_receipt,
      transaction_date: transaction.transaction_date,
      result_code: transaction.result_code,
      result_desc: transaction.result_desc
    });
  } catch (error) {
    console.error('Transaction status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`M-Pesa service running on port ${PORT}`);
});

module.exports = app;
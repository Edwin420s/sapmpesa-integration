const mpesaAPI = require('../utils/mpesaAPI');
const security = require('../utils/security');
const Transaction = require('../../database/models/Transaction');

class MpesaController {
  async stkPush(req, res) {
    try {
      const { 
        amount, 
        phone, 
        account_reference, 
        transaction_desc,
        callback_url 
      } = req.body;

      // Format phone number
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
        TransactionDesc: transaction_desc || `Payment for ${account_reference}`
      });

      // Save transaction to database
      const transaction = await Transaction.create({
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

      res.json({
        success: true,
        checkout_request_id: stkResponse.CheckoutRequestID,
        merchant_request_id: stkResponse.MerchantRequestID,
        response_description: stkResponse.ResponseDescription,
        transaction_id: transaction.id
      });
    } catch (error) {
      console.error('STK Push error:', error);
      
      if (error.response) {
        res.status(error.response.status).json({
          success: false,
          message: error.response.data.errorMessage || 'STK Push failed'
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    }
  }

  async b2cPayment(req, res) {
    try {
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
      const transaction = await Transaction.create({
        conversation_id: b2cResponse.ConversationID,
        originator_conversation_id: b2cResponse.OriginatorConversationID,
        amount: amount,
        phone_number: formattedPhone,
        transaction_type: 'B2C',
        status: 'PENDING',
        request_payload: req.body,
        response_payload: b2cResponse
      });

      res.json({
        success: true,
        conversation_id: b2cResponse.ConversationID,
        originator_conversation_id: b2cResponse.OriginatorConversationID,
        response_description: b2cResponse.ResponseDescription,
        transaction_id: transaction.id
      });
    } catch (error) {
      console.error('B2C error:', error);
      
      if (error.response) {
        res.status(error.response.status).json({
          success: false,
          message: error.response.data.errorMessage || 'B2C payment failed'
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    }
  }

  async handleCallback(req, res) {
    try {
      console.log('M-Pesa callback received:', JSON.stringify(req.body, null, 2));
      
      // Validate callback
      if (!req.body.Body || !req.body.Body.stkCallback) {
        return res.status(400).json({ 
          ResultCode: 1, 
          ResultDesc: 'Invalid callback format' 
        });
      }

      const callback = req.body.Body.stkCallback;
      const checkoutRequestID = callback.CheckoutRequestID;
      
      // Find transaction
      const transaction = await Transaction.findOne({ 
        where: { checkout_request_id: checkoutRequestID } 
      });

      if (!transaction) {
        console.warn('Transaction not found for checkout request:', checkoutRequestID);
        return res.status(404).json({ 
          ResultCode: 1, 
          ResultDesc: 'Transaction not found' 
        });
      }

      // Update transaction based on callback
      if (callback.ResultCode === 0) {
        // Success
        const item = callback.CallbackMetadata.Item;
        const amount = item.find(i => i.Name === 'Amount')?.Value;
        const mpesaReceipt = item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
        const phone = item.find(i => i.Name === 'PhoneNumber')?.Value;
        const transactionDate = item.find(i => i.Name === 'TransactionDate')?.Value;

        await transaction.update({
          status: 'SUCCESS',
          mpesa_receipt: mpesaReceipt,
          transaction_date: transactionDate,
          result_code: callback.ResultCode,
          result_desc: callback.ResultDesc,
          callback_payload: req.body
        });

        // TODO: Trigger SAP update and notifications

      } else {
        // Failure
        await transaction.update({
          status: 'FAILED',
          result_code: callback.ResultCode,
          result_desc: callback.ResultDesc,
          callback_payload: req.body
        });

        // TODO: Trigger notifications for failure
      }

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
  }

  async getTransactionStatus(req, res) {
    try {
      const { checkoutRequestId } = req.params;

      const transaction = await Transaction.findOne({ 
        where: { checkout_request_id: checkoutRequestId } 
      });

      if (!transaction) {
        return res.status(404).json({ 
          success: false, 
          message: 'Transaction not found' 
        });
      }

      res.json({
        success: true,
        transaction: {
          checkout_request_id: transaction.checkout_request_id,
          status: transaction.status,
          amount: transaction.amount,
          phone_number: transaction.phone_number,
          mpesa_receipt: transaction.mpesa_receipt,
          transaction_date: transaction.transaction_date,
          result_code: transaction.result_code,
          result_desc: transaction.result_desc,
          created_at: transaction.created_at
        }
      });
    } catch (error) {
      console.error('Transaction status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async queryTransactionStatus(req, res) {
    try {
      const { transactionId, identifierType = '1' } = req.body;

      // This would query M-Pesa API for transaction status
      // For now, we'll return the status from our database
      const transaction = await Transaction.findByPk(transactionId);

      if (!transaction) {
        return res.status(404).json({ 
          success: false, 
          message: 'Transaction not found' 
        });
      }

      res.json({
        success: true,
        transaction: {
          id: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          phone_number: transaction.phone_number,
          mpesa_receipt: transaction.mpesa_receipt,
          result_code: transaction.result_code,
          result_desc: transaction.result_desc
        }
      });
    } catch (error) {
      console.error('Query transaction error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
}

module.exports = new MpesaController();
const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const Transaction = require('../database/models/Transaction');
const connectDB = require('../database/connectors/postgres');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// SAP Configuration
const SAP_CONFIG = {
  baseURL: process.env.SAP_BASE_URL,
  username: process.env.SAP_USERNAME,
  password: process.env.SAP_PASSWORD,
  client: process.env.SAP_CLIENT,
  language: process.env.SAP_LANGUAGE || 'EN'
};

// SAP API Client
class SAPClient {
  constructor() {
    this.authToken = null;
    this.tokenExpiry = null;
  }

  async authenticate() {
    if (this.authToken && this.tokenExpiry > Date.now()) {
      return this.authToken;
    }

    try {
      const response = await axios.post(`${SAP_CONFIG.baseURL}/sap/bc/sec/oauth2/token`, 
        `grant_type=client_credentials&client_id=${SAP_CONFIG.username}&client_secret=${SAP_CONFIG.password}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.authToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

      return this.authToken;
    } catch (error) {
      console.error('SAP authentication failed:', error);
      throw new Error('SAP authentication failed');
    }
  }

  async createAccountingDocument(documentData) {
    try {
      const token = await this.authenticate();

      const response = await axios.post(
        `${SAP_CONFIG.baseURL}/sap/opu/odata/sap/API_ACCOUNTINGDOCUMENT`,
        documentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-csrf-token': 'fetch'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('SAP API request failed:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error.message.value || 'SAP API request failed');
      } else {
        throw new Error('SAP service unavailable');
      }
    }
  }

  async getAccountingDocument(documentId) {
    try {
      const token = await this.authenticate();

      const response = await axios.get(
        `${SAP_CONFIG.baseURL}/sap/opu/odata/sap/API_ACCOUNTINGDOCUMENT('${documentId}')`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('SAP get document failed:', error);
      throw new Error('Failed to retrieve SAP document');
    }
  }
}

const sapClient = new SAPClient();

// Routes
app.post('/sync-transaction', 
  [
    body('transaction_id').isInt().withMessage('Valid transaction ID required'),
    body('sap_company_code').notEmpty().withMessage('SAP company code required'),
    body('sap_document_type').notEmpty().withMessage('SAP document type required'),
    body('sap_posting_date').isISO8601().withMessage('Valid posting date required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { transaction_id, sap_company_code, sap_document_type, sap_posting_date } = req.body;

      // Get transaction from database
      const transaction = await Transaction.findByPk(transaction_id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.status !== 'SUCCESS') {
        return res.status(400).json({ error: 'Only successful transactions can be synced with SAP' });
      }

      if (transaction.sap_sync_status === 'SYNCED') {
        return res.status(400).json({ error: 'Transaction already synced with SAP' });
      }

      // Prepare SAP document data
      const documentData = {
        CompanyCode: sap_company_code,
        DocumentType: sap_document_type,
        PostingDate: sap_posting_date,
        DocumentDate: sap_posting_date,
        Currency: 'KES',
        DocumentHeaderText: `M-Pesa Payment - ${transaction.mpesa_receipt}`,
        items: [
          {
            Account: process.env.SAP_CASH_ACCOUNT,
            AmountInTransactionCurrency: transaction.amount,
            DebitCreditCode: 'S', // Debit for cash account
            BusinessArea: process.env.SAP_BUSINESS_AREA,
            CostCenter: process.env.SAP_COST_CENTER,
            Assignment: transaction.account_reference || transaction.phone_number
          },
          {
            Account: process.env.SAP_REVENUE_ACCOUNT,
            AmountInTransactionCurrency: transaction.amount,
            DebitCreditCode: 'H', // Credit for revenue account
            BusinessArea: process.env.SAP_BUSINESS_AREA,
            CostCenter: process.env.SAP_COST_CENTER,
            Assignment: transaction.account_reference || transaction.phone_number
          }
        ]
      };

      // Create SAP document
      const sapResponse = await sapClient.createAccountingDocument(documentData);

      // Update transaction with SAP reference
      transaction.sap_reference = sapResponse.documentId;
      transaction.sap_sync_status = 'SYNCED';
      transaction.sap_sync_date = new Date();
      await transaction.save();

      res.json({
        success: true,
        message: 'Transaction synced with SAP successfully',
        sap_reference: sapResponse.documentId,
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          mpesa_receipt: transaction.mpesa_receipt
        }
      });
    } catch (error) {
      console.error('SAP sync error:', error);
      
      // Update transaction with sync failure
      if (transaction) {
        transaction.sap_sync_status = 'FAILED';
        transaction.error_message = error.message;
        await transaction.save();
      }

      res.status(500).json({ 
        error: 'Failed to sync with SAP',
        details: error.message 
      });
    }
  }
);

app.get('/document/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await sapClient.getAccountingDocument(documentId);

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Get SAP document error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve SAP document',
      details: error.message 
    });
  }
});

app.post('/callback', async (req, res) => {
  try {
    // Handle SAP callbacks (for asynchronous processing)
    const { event, data } = req.body;

    console.log('SAP callback received:', { event, data });

    // TODO: Implement SAP callback handling
    // This would typically update transaction status based on SAP processing results

    res.json({ success: true, message: 'Callback received' });
  } catch (error) {
    console.error('SAP callback error:', error);
    res.status(500).json({ error: 'Failed to process SAP callback' });
  }
});

app.get('/health', async (req, res) => {
  try {
    // Test SAP connectivity
    await sapClient.authenticate();
    res.json({ status: 'OK', service: 'SAP Integration' });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      service: 'SAP Integration',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`SAP service running on port ${PORT}`);
});

module.exports = app;
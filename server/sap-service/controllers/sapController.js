const sapConnector = require('../utils/sapConnector');
const Transaction = require('../../database/models/Transaction');

class SAPController {
  async syncTransaction(req, res) {
    try {
      const { transaction_id, sap_company_code, sap_document_type, sap_posting_date } = req.body;

      // Get transaction from database
      const transaction = await Transaction.findByPk(transaction_id);
      if (!transaction) {
        return res.status(404).json({ 
          success: false, 
          message: 'Transaction not found' 
        });
      }

      if (transaction.status !== 'SUCCESS') {
        return res.status(400).json({ 
          success: false, 
          message: 'Only successful transactions can be synced with SAP' 
        });
      }

      if (transaction.sap_sync_status === 'SYNCED') {
        return res.status(400).json({ 
          success: false, 
          message: 'Transaction already synced with SAP' 
        });
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
      const sapResponse = await sapConnector.createAccountingDocument(documentData);

      // Update transaction with SAP reference
      await transaction.update({
        sap_reference: sapResponse.documentId,
        sap_sync_status: 'SYNCED',
        sap_sync_date: new Date()
      });

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
        await transaction.update({
          sap_sync_status: 'FAILED',
          error_message: error.message
        });
      }

      res.status(500).json({ 
        success: false,
        message: 'Failed to sync with SAP',
        error: error.message 
      });
    }
  }

  async getDocument(req, res) {
    try {
      const { documentId } = req.params;

      const document = await sapConnector.getAccountingDocument(documentId);

      res.json({
        success: true,
        document
      });
    } catch (error) {
      console.error('Get SAP document error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to retrieve SAP document',
        error: error.message 
      });
    }
  }

  async handleCallback(req, res) {
    try {
      const { event, data } = req.body;

      console.log('SAP callback received:', { event, data });

      // Handle different SAP callback events
      switch (event) {
        case 'DOCUMENT_CREATED':
          // Update transaction status based on SAP processing
          if (data.documentId && data.status === 'SUCCESS') {
            await Transaction.update(
              { sap_sync_status: 'SYNCED', sap_reference: data.documentId },
              { where: { sap_reference: data.documentId } }
            );
          }
          break;

        case 'DOCUMENT_ERROR':
          // Mark transaction as failed in SAP sync
          if (data.documentId) {
            await Transaction.update(
              { sap_sync_status: 'FAILED', error_message: data.errorMessage },
              { where: { sap_reference: data.documentId } }
            );
          }
          break;

        default:
          console.warn('Unknown SAP callback event:', event);
      }

      res.json({ 
        success: true, 
        message: 'Callback processed successfully' 
      });
    } catch (error) {
      console.error('SAP callback error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process SAP callback' 
      });
    }
  }

  async getHealth(req, res) {
    try {
      // Test SAP connectivity
      await sapConnector.authenticate();
      
      res.json({ 
        success: true, 
        status: 'HEALTHY', 
        message: 'SAP connectivity is healthy' 
      });
    } catch (error) {
      res.status(503).json({ 
        success: false,
        status: 'UNHEALTHY', 
        message: 'SAP connectivity issue',
        error: error.message 
      });
    }
  }

  async queryTransactions(req, res) {
    try {
      const { company_code, document_type, posting_date } = req.query;

      // Query SAP for transactions
      const query = {
        $filter: `CompanyCode eq '${company_code}' and DocumentType eq '${document_type}' and PostingDate eq ${posting_date}`
      };

      const transactions = await sapConnector.queryTable('API_ACCOUNTINGDOCUMENT', query);

      res.json({
        success: true,
        transactions: transactions.value
      });
    } catch (error) {
      console.error('Query SAP transactions error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to query SAP transactions',
        error: error.message 
      });
    }
  }
}

module.exports = new SAPController();
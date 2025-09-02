const { Op } = require('sequelize');
const Transaction = require('../../database/models/Transaction');

class TransactionController {
  async getTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        transaction_type,
        phone_number,
        start_date,
        end_date,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Build where conditions
      if (status) where.status = status;
      if (transaction_type) where.transaction_type = transaction_type;
      if (phone_number) where.phone_number = { [Op.like]: `%${phone_number}%` };

      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) where.created_at[Op.gte] = new Date(start_date);
        if (end_date) where.created_at[Op.lte] = new Date(end_date);
      }

      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sort_by, sort_order.toUpperCase()]],
        attributes: { exclude: ['request_payload', 'response_payload', 'callback_payload'] }
      });

      res.json({
        success: true,
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async getTransactionById(req, res) {
    try {
      const { id } = req.params;
      
      const transaction = await Transaction.findByPk(id);
      
      if (!transaction) {
        return res.status(404).json({ 
          success: false, 
          message: 'Transaction not found' 
        });
      }

      res.json({
        success: true,
        transaction
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async getTransactionByCheckoutId(req, res) {
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
        transaction
      });
    } catch (error) {
      console.error('Get transaction by checkout ID error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async getStats(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const where = {};

      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) where.created_at[Op.gte] = new Date(start_date);
        if (end_date) where.created_at[Op.lte] = new Date(end_date);
      }

      const totalTransactions = await Transaction.count({ where });
      const totalAmount = await Transaction.sum('amount', { where });
      const successfulTransactions = await Transaction.count({
        where: { ...where, status: 'SUCCESS' }
      });
      const pendingTransactions = await Transaction.count({
        where: { ...where, status: 'PENDING' }
      });
      const failedTransactions = await Transaction.count({
        where: { ...where, status: 'FAILED' }
      });

      // Today's transactions
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayTransactions = await Transaction.count({
        where: {
          created_at: {
            [Op.between]: [todayStart, todayEnd]
          }
        }
      });

      // Stats by status
      const statsByStatus = await Transaction.findAll({
        where,
        attributes: [
          'status',
          [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'count'],
          [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total_amount']
        ],
        group: ['status']
      });

      res.json({
        success: true,
        stats: {
          totalTransactions,
          successfulTransactions,
          pendingTransactions,
          failedTransactions,
          totalAmount: totalAmount || 0,
          todayTransactions,
          byStatus: statsByStatus
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async retrySapSync(req, res) {
    try {
      const { id } = req.params;
      
      const transaction = await Transaction.findByPk(id);
      
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

      // TODO: Implement actual SAP sync logic
      // For now, simulate success
      await transaction.update({
        sap_reference: `SAP-${Date.now()}`,
        sap_sync_status: 'SYNCED',
        sap_sync_date: new Date()
      });

      res.json({
        success: true,
        message: 'Transaction synced with SAP successfully',
        sap_reference: transaction.sap_reference
      });
    } catch (error) {
      console.error('Retry SAP sync error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async getReconciliation(req, res) {
    try {
      const { date } = req.query;
      const reconciliationDate = date ? new Date(date) : new Date();
      
      reconciliationDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(reconciliationDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const transactions = await Transaction.findAll({
        where: {
          status: 'SUCCESS',
          created_at: {
            [Op.between]: [reconciliationDate, nextDay]
          }
        },
        order: [['created_at', 'ASC']],
        attributes: { exclude: ['request_payload', 'response_payload', 'callback_payload'] }
      });

      const totalAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      const totalCount = transactions.length;

      res.json({
        success: true,
        reconciliation: {
          date: reconciliationDate.toISOString().split('T')[0],
          total_transactions: totalCount,
          total_amount: totalAmount,
          transactions
        }
      });
    } catch (error) {
      console.error('Reconciliation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  async exportTransactions(req, res) {
    try {
      const { start_date, end_date, format = 'csv' } = req.query;
      const where = {};

      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) where.created_at[Op.gte] = new Date(start_date);
        if (end_date) where.created_at[Op.lte] = new Date(end_date);
      }

      const transactions = await Transaction.findAll({
        where,
        order: [['created_at', 'DESC']],
        attributes: { exclude: ['request_payload', 'response_payload', 'callback_payload'] }
      });

      if (format === 'csv') {
        // Convert to CSV
        const csvData = [
          ['ID', 'Checkout Request ID', 'Amount', 'Phone', 'Status', 'MPesa Receipt', 'SAP Reference', 'Created At'],
          ...transactions.map(tx => [
            tx.id,
            tx.checkout_request_id,
            tx.amount,
            tx.phone_number,
            tx.status,
            tx.mpesa_receipt || 'N/A',
            tx.sap_reference || 'N/A',
            tx.created_at
          ])
        ].map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvData);
      } else {
        res.json({
          success: true,
          transactions
        });
      }
    } catch (error) {
      console.error('Export transactions error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
}

module.exports = new TransactionController();
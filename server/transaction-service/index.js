const express = require('express');
const { Op } = require('sequelize');
const Transaction = require('../database/models/Transaction');
const connectDB = require('../database/connectors/postgres');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.get('/transactions', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
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
      order: [[sort_by, sort_order.toUpperCase()]]
    });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findByPk(id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/transactions/by-checkout/:checkoutRequestId', async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    
    const transaction = await Transaction.findOne({
      where: { checkout_request_id: checkoutRequestId }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction by checkout ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};

    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date);
    }

    const stats = await Transaction.findAll({
      where,
      attributes: [
        'status',
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'count'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total_amount']
      ],
      group: ['status']
    });

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

    res.json({
      totalTransactions,
      successfulTransactions,
      pendingTransactions,
      failedTransactions,
      totalAmount: totalAmount || 0,
      todayTransactions,
      byStatus: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/transactions/:id/retry-sap', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findByPk(id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'SUCCESS') {
      return res.status(400).json({ error: 'Only successful transactions can be synced with SAP' });
    }

    if (transaction.sap_sync_status === 'SYNCED') {
      return res.status(400).json({ error: 'Transaction already synced with SAP' });
    }

    // TODO: Implement SAP sync logic
    // This would typically involve:
    // 1. Calling SAP API to create accounting document
    // 2. Updating transaction with SAP reference
    // 3. Setting sap_sync_status to 'SYNCED'

    // For now, simulate success
    transaction.sap_reference = `SAP-${Date.now()}`;
    transaction.sap_sync_status = 'SYNCED';
    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction synced with SAP successfully',
      sap_reference: transaction.sap_reference
    });
  } catch (error) {
    console.error('Retry SAP sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/reconciliation', async (req, res) => {
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
      order: [['created_at', 'ASC']]
    });

    const totalAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const totalCount = transactions.length;

    res.json({
      date: reconciliationDate.toISOString().split('T')[0],
      total_transactions: totalCount,
      total_amount: totalAmount,
      transactions
    });
  } catch (error) {
    console.error('Reconciliation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Transaction service running on port ${PORT}`);
});

module.exports = app;
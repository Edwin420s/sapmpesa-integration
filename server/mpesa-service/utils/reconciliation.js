const { Op } = require('sequelize');
const Transaction = require('../../database/models/Transaction');

class ReconciliationService {
  async dailyReconciliation(date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await Transaction.findAll({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['created_at', 'ASC']]
    });

    const summary = {
      date: date,
      total_transactions: transactions.length,
      total_amount: transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
      by_status: this.groupByStatus(transactions),
      by_type: this.groupByType(transactions),
      successful_transactions: transactions.filter(tx => tx.status === 'SUCCESS').length,
      failed_transactions: transactions.filter(tx => tx.status === 'FAILED').length,
      pending_transactions: transactions.filter(tx => tx.status === 'PENDING').length
    };

    return {
      summary,
      transactions
    };
  }

  groupByStatus(transactions) {
    return transactions.reduce((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    }, {});
  }

  groupByType(transactions) {
    return transactions.reduce((acc, tx) => {
      acc[tx.transaction_type] = (acc[tx.transaction_type] || 0) + 1;
      return acc;
    }, {});
  }

  async findDiscrepancies(sapData, mpesaData) {
    const discrepancies = [];

    // Compare SAP and M-Pesa data to find mismatches
    for (const sapTransaction of sapData) {
      const mpesaTransaction = mpesaData.find(
        mp => mp.reference === sapTransaction.reference
      );

      if (!mpesaTransaction) {
        discrepancies.push({
          type: 'MISSING',
          reference: sapTransaction.reference,
          amount: sapTransaction.amount,
          description: 'Transaction found in SAP but not in M-Pesa'
        });
        continue;
      }

      if (Math.abs(sapTransaction.amount - mpesaTransaction.amount) > 0.01) {
        discrepancies.push({
          type: 'AMOUNT_MISMATCH',
          reference: sapTransaction.reference,
          sap_amount: sapTransaction.amount,
          mpesa_amount: mpesaTransaction.amount,
          difference: Math.abs(sapTransaction.amount - mpesaTransaction.amount)
        });
      }
    }

    // Check for M-Pesa transactions not in SAP
    for (const mpesaTransaction of mpesaData) {
      const sapTransaction = sapData.find(
        sap => sap.reference === mpesaTransaction.reference
      );

      if (!sapTransaction) {
        discrepancies.push({
          type: 'MISSING',
          reference: mpesaTransaction.reference,
          amount: mpesaTransaction.amount,
          description: 'Transaction found in M-Pesa but not in SAP'
        });
      }
    }

    return discrepancies;
  }

  async generateReconciliationReport(date) {
    const reconciliation = await this.dailyReconciliation(date);
    const report = {
      generated_at: new Date(),
      report_date: date,
      summary: reconciliation.summary,
      discrepancies: await this.findDiscrepancies([], reconciliation.transactions), // Empty SAP data for demo
      transactions: reconciliation.transactions
    };

    return report;
  }
}

module.exports = new ReconciliationService();
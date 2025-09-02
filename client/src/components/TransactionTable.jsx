import React from 'react';
import './TransactionTable.css';

const TransactionTable = ({ transactions, loading }) => {
  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  if (!transactions || transactions.length === 0) {
    return <div className="no-data">No transactions found</div>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  return (
    <div className="transaction-table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Amount</th>
            <th>Phone Number</th>
            <th>Account Reference</th>
            <th>Status</th>
            <th>Date</th>
            <th>MPesa Receipt</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.checkout_request_id}</td>
              <td>KES {transaction.amount}</td>
              <td>{transaction.phone_number}</td>
              <td>{transaction.account_reference}</td>
              <td className={getStatusClass(transaction.status)}>
                {transaction.status}
              </td>
              <td>{formatDate(transaction.created_at)}</td>
              <td>{transaction.mpesa_receipt || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
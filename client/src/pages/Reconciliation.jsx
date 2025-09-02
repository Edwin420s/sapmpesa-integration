import React, { useState } from 'react';
import { getReconciliation } from '../services/api';
import TransactionTable from '../components/TransactionTable';
import Loader from '../components/Loader';
import './Reconciliation.css';

const Reconciliation = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reconciliationData, setReconciliationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReconcile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getReconciliation(date);
      setReconciliationData(data);
    } catch (err) {
      setError('Failed to fetch reconciliation data');
      console.error('Reconciliation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reconciliationData) return;
    
    const csvContent = [
      ['Date', 'Transaction ID', 'Amount', 'Phone', 'Status', 'MPesa Receipt', 'SAP Reference'],
      ...reconciliationData.transactions.map(tx => [
        new Date(tx.created_at).toLocaleDateString(),
        tx.checkout_request_id,
        tx.amount,
        tx.phone_number,
        tx.status,
        tx.mpesa_receipt || 'N/A',
        tx.sap_reference || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation-${date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="reconciliation-container">
      <div className="reconciliation-header">
        <h1>Reconciliation</h1>
        <p>Compare M-Pesa transactions with SAP records</p>
      </div>

      <div className="reconciliation-controls">
        <div className="date-selector">
          <label htmlFor="reconciliation-date">Select Date:</label>
          <input
            type="date"
            id="reconciliation-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        
        <button 
          onClick={handleReconcile} 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Reconciling...' : 'Run Reconciliation'}
        </button>

        {reconciliationData && (
          <button 
            onClick={handleExport} 
            className="btn btn-secondary"
          >
            Export CSV
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && <Loader message="Running reconciliation..." />}

      {reconciliationData && !loading && (
        <div className="reconciliation-results">
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Transactions</h3>
              <p className="number">{reconciliationData.total_transactions}</p>
            </div>
            <div className="summary-card">
              <h3>Total Amount</h3>
              <p className="number">KES {reconciliationData.total_amount?.toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <h3>Date</h3>
              <p>{reconciliationData.date}</p>
            </div>
          </div>

          <h2>Transaction Details</h2>
          <TransactionTable transactions={reconciliationData.transactions} />
        </div>
      )}
    </div>
  );
};

export default Reconciliation;
import React, { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';
import TransactionTable from '../components/TransactionTable';
import Loader from '../components/Loader';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    transaction_type: '',
    phone_number: '',
    start_date: '',
    end_date: ''
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await getTransactions(params.toString());
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Export transactions');
  };

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h1>Transactions</h1>
        <button onClick={handleExport} className="btn btn-secondary">
          Export CSV
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Status</label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select 
            value={filters.transaction_type} 
            onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="STK_PUSH">STK Push</option>
            <option value="B2C">B2C</option>
            <option value="C2B">C2B</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Phone Number</label>
          <input
            type="text"
            placeholder="2547XXXXXXXX"
            value={filters.phone_number}
            onChange={(e) => handleFilterChange('phone_number', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
          />
        </div>

        <button onClick={fetchTransactions} className="btn btn-primary">
          Apply Filters
        </button>
      </div>

      {loading ? (
        <Loader message="Loading transactions..." />
      ) : (
        <>
          <TransactionTable transactions={transactions} />
          
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="btn btn-outline"
              >
                Previous
              </button>
              
              <span>
                Page {filters.page} of {pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === pagination.pages}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;
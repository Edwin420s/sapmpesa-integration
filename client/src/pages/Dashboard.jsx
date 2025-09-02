import React, { useState, useEffect } from 'react';
import DashboardCards from '../components/DashboardCards';
import { getDashboardStats, getRecentTransactions } from '../services/api';
import Loader from '../components/Loader';
import TransactionTable from '../components/TransactionTable';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, transactionsData] = await Promise.all([
        getDashboardStats(),
        getRecentTransactions()
      ]);
      setStats(statsData);
      setRecentTransactions(transactionsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={fetchDashboardData} className="btn btn-secondary">
          Refresh Data
        </button>
      </div>

      <DashboardCards stats={stats} />

      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        <TransactionTable 
          transactions={recentTransactions} 
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { getReports, getDashboardStats } from '../services/api';
import Loader from '../components/Loader';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [reportsData, statsData] = await Promise.all([
        getReports(dateRange),
        getDashboardStats(dateRange)
      ]);
      setReports(reportsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = (format = 'csv') => {
    // Implement export functionality
    console.log(`Exporting reports in ${format} format`);
  };

  if (loading) {
    return <Loader message="Loading reports..." />;
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <div className="export-buttons">
          <button onClick={() => handleExport('csv')} className="btn btn-secondary">
            Export CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="btn btn-secondary">
            Export PDF
          </button>
        </div>
      </div>

      <div className="date-filter">
        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange('start', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateChange('end', e.target.value)}
          />
        </div>
        <button onClick={fetchReports} className="btn btn-primary">
          Apply Filter
        </button>
      </div>

      {stats && (
        <div className="stats-overview">
          <h2>Performance Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">KES {stats.totalAmount?.toLocaleString()}</p>
              <p className="stat-label">{stats.totalTransactions} transactions</p>
            </div>
            <div className="stat-card">
              <h3>Success Rate</h3>
              <p className="stat-value">
                {stats.totalTransactions > 0 
                  ? ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)
                  : 0
                }%
              </p>
              <p className="stat-label">
                {stats.successfulTransactions} successful of {stats.totalTransactions}
              </p>
            </div>
            <div className="stat-card">
              <h3>Average Transaction</h3>
              <p className="stat-value">
                KES {stats.totalTransactions > 0 
                  ? (stats.totalAmount / stats.totalTransactions).toFixed(2)
                  : 0
                }
              </p>
              <p className="stat-label">Per transaction</p>
            </div>
          </div>
        </div>
      )}

      <div className="reports-content">
        <div className="report-section">
          <h2>Transaction Reports</h2>
          <div className="report-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transactions</th>
                  <th>Amount</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={index}>
                    <td>{report.date}</td>
                    <td>{report.transactionCount}</td>
                    <td>KES {report.totalAmount?.toLocaleString()}</td>
                    <td>{report.successRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="charts-section">
          <h2>Visualizations</h2>
          <div className="charts-grid">
            <div className="chart-placeholder">
              <h4>Transaction Volume</h4>
              <p>Chart would be displayed here</p>
            </div>
            <div className="chart-placeholder">
              <h4>Revenue Trend</h4>
              <p>Chart would be displayed here</p>
            </div>
            <div className="chart-placeholder">
              <h4>Status Distribution</h4>
              <p>Chart would be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
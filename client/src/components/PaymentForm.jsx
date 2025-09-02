import React, { useState } from 'react';
import { initiatePayment } from '../services/api';
import './PaymentForm.css';

const PaymentForm = ({ onPaymentInitiated }) => {
  const [formData, setFormData] = useState({
    amount: '',
    phone: '',
    account_reference: '',
    transaction_desc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await initiatePayment(formData);
      onPaymentInitiated(result);
      setFormData({
        amount: '',
        phone: '',
        account_reference: '',
        transaction_desc: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
      <form onSubmit={handleSubmit} className="payment-form">
        <h2>Initiate M-Pesa Payment</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Amount (KES)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter amount"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-input"
            placeholder="2547XXXXXXXX"
            pattern="2547[0-9]{8}"
            required
          />
          <small className="form-help">
            Format: 2547XXXXXXXX (e.g., 254712345678)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="account_reference" className="form-label">
            Account Reference
          </label>
          <input
            type="text"
            id="account_reference"
            name="account_reference"
            value={formData.account_reference}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter account reference"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="transaction_desc" className="form-label">
            Transaction Description
          </label>
          <textarea
            id="transaction_desc"
            name="transaction_desc"
            value={formData.transaction_desc}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter transaction description"
            rows="3"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Initiating Payment...' : 'Initiate Payment'}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
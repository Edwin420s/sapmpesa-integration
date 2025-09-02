import React, { useState } from 'react';
import PaymentForm from '../components/PaymentForm';
import { initiatePayment } from '../services/api';
import './Payments.css';

const Payments = () => {
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState('');

  const handlePaymentInitiated = (result) => {
    setPaymentResult(result);
    setError('');
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setPaymentResult(null);
  };

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h1>Initiate Payment</h1>
        <p>Create a new M-Pesa payment request</p>
      </div>

      <div className="payments-content">
        <div className="payment-form-section">
          <PaymentForm 
            onPaymentInitiated={handlePaymentInitiated}
            onError={handlePaymentError}
          />
        </div>

        {paymentResult && (
          <div className="payment-result success">
            <h3>Payment Initiated Successfully!</h3>
            <div className="result-details">
              <p><strong>Checkout Request ID:</strong> {paymentResult.checkout_request_id}</p>
              <p><strong>Merchant Request ID:</strong> {paymentResult.merchant_request_id}</p>
              <p><strong>Status:</strong> <span className="status-pending">Pending</span></p>
            </div>
            <p className="instruction">
              The customer will receive an STK push notification on their phone to complete the payment.
            </p>
          </div>
        )}

        {error && (
          <div className="payment-result error">
            <h3>Payment Failed</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
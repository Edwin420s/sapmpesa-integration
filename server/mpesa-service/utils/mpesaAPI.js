const axios = require('axios');
const crypto = require('crypto');

class MpesaAPI {
  constructor() {
    this.baseURL = process.env.MPESA_ENVIRONMENT === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    
    this.authToken = null;
    this.tokenExpiry = null;
  }

  async getAuthToken() {
    if (this.authToken && this.tokenExpiry > Date.now()) {
      return this.authToken;
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
      const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      this.authToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer

      return this.authToken;
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw new Error('Failed to authenticate with M-Pesa API');
    }
  }

  async makeRequest(endpoint, data) {
    try {
      const token = await this.getAuthToken();

      const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('M-Pesa API request failed:', error);
      
      if (error.response) {
        throw new Error(error.response.data.errorMessage || 'M-Pesa API request failed');
      } else if (error.request) {
        throw new Error('No response received from M-Pesa API');
      } else {
        throw new Error('Error setting up M-Pesa API request');
      }
    }
  }

  async stkPush(data) {
    return this.makeRequest('/mpesa/stkpush/v1/processrequest', data);
  }

  async b2cPayment(data) {
    return this.makeRequest('/mpesa/b2c/v1/paymentrequest', data);
  }

  async transactionStatus(data) {
    return this.makeRequest('/mpesa/transactionstatus/v1/query', data);
  }

  async accountBalance(data) {
    return this.makeRequest('/mpesa/accountbalance/v1/query', data);
  }

  async reversal(data) {
    return this.makeRequest('/mpesa/reversal/v1/request', data);
  }
}

module.exports = new MpesaAPI();
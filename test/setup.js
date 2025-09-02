// Global test setup
process.env.NODE_ENV = 'test';

// Increase timeout for all tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Mock M-Pesa API responses
  mockMpesaResponses: {
    stkPushSuccess: {
      MerchantRequestID: '12345-67890-1',
      CheckoutRequestID: 'ws_CO_01012023123456',
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: 'Success. Request accepted for processing'
    },
    stkPushFailure: {
      requestId: '12345-67890-1',
      errorCode: '400.002.02',
      errorMessage: 'Bad Request - Invalid Phone Number'
    },
    authToken: {
      access_token: 'test_access_token',
      expires_in: '3599'
    }
  },

  // Generate test data
  generateTestTransaction: (overrides = {}) => ({
    checkout_request_id: 'test_' + Date.now(),
    amount: 1000,
    phone_number: '254712345678',
    account_reference: 'TEST_REF',
    transaction_type: 'STK_PUSH',
    status: 'PENDING',
    ...overrides
  }),

  // Wait utility
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Clean up after all tests
afterAll(async () => {
  // Close any open connections
  if (global.__MONGOOSE_CONNECTION__) {
    await global.__MONGOOSE_CONNECTION__.close();
  }
  
  if (global.__SEQUELIZE_CONNECTION__) {
    await global.__SEQUELIZE_CONNECTION__.close();
  }
});
const request = require('supertest');
const app = require('../index');

// Mock the M-Pesa API calls
jest.mock('../utils/mpesaAPI', () => ({
  stkPush: jest.fn().mockResolvedValue({
    CheckoutRequestID: 'test_checkout_id',
    MerchantRequestID: 'test_merchant_id',
    ResponseDescription: 'Success'
  }),
  b2cPayment: jest.fn().mockResolvedValue({
    ConversationID: 'test_conversation_id',
    OriginatorConversationID: 'test_originator_id',
    ResponseDescription: 'Success'
  })
}));

describe('M-Pesa Service', () => {
  describe('POST /mpesa/stk-push', () => {
    it('should initiate STK push successfully', async () => {
      const response = await request(app)
        .post('/mpesa/stk-push')
        .send({
          amount: 1000,
          phone: '254712345678',
          account_reference: 'TEST123',
          transaction_desc: 'Test payment'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.checkout_request_id).toBe('test_checkout_id');
    });

    it('should fail with invalid phone number', async () => {
      const response = await request(app)
        .post('/mpesa/stk-push')
        .send({
          amount: 1000,
          phone: 'invalid',
          account_reference: 'TEST123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /mpesa/callback', () => {
    it('should process callback successfully', async () => {
      const callbackData = {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'test_checkout_id',
            ResultCode: 0,
            ResultDesc: 'Success',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 1000 },
                { Name: 'MpesaReceiptNumber', Value: 'TEST123' },
                { Name: 'PhoneNumber', Value: '254712345678' }
              ]
            }
          }
        }
      };

      const response = await request(app)
        .post('/mpesa/callback')
        .send(callbackData);

      expect(response.status).toBe(200);
      expect(response.body.ResultCode).toBe(0);
    });
  });
});

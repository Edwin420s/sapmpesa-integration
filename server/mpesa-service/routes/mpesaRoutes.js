const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../../shared/middleware/validation');
const { userActivityMiddleware } = require('../../shared/middleware/auditMiddleware');
const { stkPushValidation, b2cValidation } = require('../utils/validation');

const router = express.Router();

/**
 * @swagger
 * /mpesa/stk-push:
 *   post:
 *     summary: Initiate STK Push payment
 *     tags: [M-Pesa]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - phone
 *               - account_reference
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 example: 1000
 *               phone:
 *                 type: string
 *                 pattern: '^254[17]\d{8}$'
 *                 example: '254712345678'
 *               account_reference:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 12
 *                 example: 'INV001'
 *               transaction_desc:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 13
 *                 example: 'Payment for invoice'
 *               callback_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: STK Push initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 checkout_request_id:
 *                   type: string
 *                 merchant_request_id:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: M-Pesa API error
 */
router.post('/stk-push',
  stkPushValidation,
  validateRequest,
  userActivityMiddleware('CREATE', 'TRANSACTION'),
  async (req, res) => {
    // STK Push logic will be implemented in the controller
    res.json({ message: 'STK Push endpoint' });
  }
);

/**
 * @swagger
 * /mpesa/b2c:
 *   post:
 *     summary: Initiate B2C payment
 *     tags: [M-Pesa]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - phone
 *               - remarks
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 70000
 *                 example: 5000
 *               phone:
 *                 type: string
 *                 pattern: '^254[17]\d{8}$'
 *                 example: '254712345678'
 *               remarks:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: 'Salary payment'
 *               occasion:
 *                 type: string
 *                 maxLength: 100
 *                 example: 'January salary'
 *     responses:
 *       200:
 *         description: B2C payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation_id:
 *                   type: string
 *                 originator_conversation_id:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: M-Pesa API error
 */
router.post('/b2c',
  b2cValidation,
  validateRequest,
  userActivityMiddleware('CREATE', 'TRANSACTION'),
  async (req, res) => {
    // B2C payment logic will be implemented in the controller
    res.json({ message: 'B2C payment endpoint' });
  }
);

/**
 * @swagger
 * /mpesa/callback:
 *   post:
 *     summary: Handle M-Pesa callbacks
 *     tags: [M-Pesa]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Body:
 *                 type: object
 *                 properties:
 *                   stkCallback:
 *                     type: object
 *     responses:
 *       200:
 *         description: Callback processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ResultCode:
 *                   type: integer
 *                   example: 0
 *                 ResultDesc:
 *                   type: string
 *                   example: 'Callback processed successfully'
 *       400:
 *         description: Invalid callback format
 *       404:
 *         description: Transaction not found
 */
router.post('/callback', async (req, res) => {
  // Callback handling logic will be implemented in the controller
  res.json({ ResultCode: 0, ResultDesc: 'Callback processed successfully' });
});

/**
 * @swagger
 * /mpesa/transaction-status/{checkoutRequestId}:
 *   get:
 *     summary: Get transaction status
 *     tags: [M-Pesa]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: checkoutRequestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Checkout Request ID from STK Push
 *     responses:
 *       200:
 *         description: Transaction status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 */
router.get('/transaction-status/:checkoutRequestId', async (req, res) => {
  // Transaction status logic will be implemented in the controller
  res.json({ message: 'Transaction status endpoint' });
});

module.exports = router;

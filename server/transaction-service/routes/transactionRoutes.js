const express = require('express');
const { query } = require('express-validator');
const { validateRequest, validatePagination } = require('../../shared/middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get transactions with filtering and pagination
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED]
 *         description: Filter by status
 *       - in: query
 *         name: transaction_type
 *         schema:
 *           type: string
 *           enum: [STK_PUSH, B2C, C2B, B2B]
 *         description: Filter by transaction type
 *       - in: query
 *         name: phone_number
 *         schema:
 *           type: string
 *         description: Filter by phone number
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, amount, status]
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['PENDING', 'SUCCESS', 'FAILED']),
    query('transaction_type').optional().isIn(['STK_PUSH', 'B2C', 'C2B', 'B2B']),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601()
  ],
  validateRequest,
  validatePagination,
  async (req, res) => {
    // Transaction retrieval logic will be implemented in the controller
    res.json({ message: 'Transactions endpoint' });
  }
);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', async (req, res) => {
  // Single transaction retrieval logic will be implemented in the controller
  res.json({ message: 'Single transaction endpoint' });
});

/**
 * @swagger
 * /transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTransactions:
 *                   type: integer
 *                 successfulTransactions:
 *                   type: integer
 *                 pendingTransactions:
 *                   type: integer
 *                 failedTransactions:
 *                   type: integer
 *                 totalAmount:
 *                   type: number
 *                 todayTransactions:
 *                   type: integer
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', async (req, res) => {
  // Statistics logic will be implemented in the controller
  res.json({ message: 'Statistics endpoint' });
});

/**
 * @swagger
 * /transactions/reconciliation:
 *   get:
 *     summary: Get reconciliation report
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for reconciliation (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Reconciliation report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                 total_transactions:
 *                   type: integer
 *                 total_amount:
 *                   type: number
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/reconciliation', async (req, res) => {
  // Reconciliation logic will be implemented in the controller
  res.json({ message: 'Reconciliation endpoint' });
});

module.exports = router;
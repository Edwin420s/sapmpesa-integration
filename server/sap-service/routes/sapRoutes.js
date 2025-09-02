const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../../shared/middleware/validation');
const { userActivityMiddleware } = require('../../shared/middleware/auditMiddleware');

const router = express.Router();

/**
 * @swagger
 * /sap/sync-transaction:
 *   post:
 *     summary: Sync transaction with SAP
 *     tags: [SAP Integration]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transaction_id
 *               - sap_company_code
 *               - sap_document_type
 *               - sap_posting_date
 *             properties:
 *               transaction_id:
 *                 type: integer
 *                 example: 1
 *               sap_company_code:
 *                 type: string
 *                 example: '1000'
 *               sap_document_type:
 *                 type: string
 *                 example: 'SA'
 *               sap_posting_date:
 *                 type: string
 *                 format: date
 *                 example: '2023-01-01'
 *     responses:
 *       200:
 *         description: Transaction synced with SAP successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sap_reference:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or sync not possible
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: SAP integration error
 */
router.post('/sync-transaction',
  [
    body('transaction_id').isInt().withMessage('Valid transaction ID required'),
    body('sap_company_code').notEmpty().withMessage('SAP company code required'),
    body('sap_document_type').notEmpty().withMessage('SAP document type required'),
    body('sap_posting_date').isISO8601().withMessage('Valid posting date required')
  ],
  validateRequest,
  userActivityMiddleware('UPDATE', 'TRANSACTION'),
  async (req, res) => {
    // SAP sync logic will be implemented in the controller
    res.json({ message: 'SAP sync endpoint' });
  }
);

/**
 * @swagger
 * /sap/document/{documentId}:
 *   get:
 *     summary: Get SAP document details
 *     tags: [SAP Integration]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: SAP document ID
 *     responses:
 *       200:
 *         description: SAP document retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 document:
 *                   type: object
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: SAP integration error
 */
router.get('/document/:documentId', async (req, res) => {
  // Document retrieval logic will be implemented in the controller
  res.json({ message: 'SAP document endpoint' });
});

/**
 * @swagger
 * /sap/callback:
 *   post:
 *     summary: Handle SAP callbacks
 *     tags: [SAP Integration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Callback processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid callback format
 */
router.post('/callback', async (req, res) => {
  // SAP callback logic will be implemented in the controller
  res.json({ success: true, message: 'Callback received' });
});

module.exports = router;
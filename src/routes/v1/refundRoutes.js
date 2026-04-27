// src/routes/v1/refundRoutes.js
const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const refundController = require('../../controllers/refundController');
const { validate, validateParams } = require('../../middleware/validator');

// TEMPORARY: Skip auth for testing - Add your auth middleware later
// router.use(authenticate); // Commented out

// Refund statistics/dashboard
router.get('/stats',
  refundController.getRefundStats
);

// Refund trends over time
router.get('/trends',
  refundController.getRefundTrends
);

// Refund by reason breakdown
router.get('/by-reason',
  refundController.getRefundByReason
);

// Refund rate report
router.get('/rate',
  refundController.getRefundRateReport
);

// Refund by product
router.get('/by-product',
  refundController.getRefundByProduct
);

// Daily refund summary
router.get('/daily-summary',
  refundController.getDailyRefundSummary
);

// Export routes
router.get('/export/excel',
  refundController.exportRefundsExcel
);

router.get('/export/pdf',
  refundController.exportRefundsPDF
);

// Get all refunds with filters
router.get('/',
  refundController.getRefunds
);

// Get refunds by order ID
router.get('/order/:orderId',
  refundController.getRefundsByOrder
);

// Get single refund by ID
router.get('/:id',
  refundController.getRefundById
);

// Create new refund
router.post('/',
  validate([
    body('orderId').isMongoId().withMessage('Invalid order ID'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('reason').isIn(['duplicate', 'fraudulent', 'requested_by_customer', 'other']).withMessage('Invalid refund reason'),
    body('reasonDetails').optional().isString(),
    body('paymentId').isMongoId().withMessage('Invalid payment ID'),
  ]),
  refundController.createRefund
);

// Update refund status
router.patch('/:id/status',
  validate([
    body('status').isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
    body('notes').optional().isString(),
    body('transactionId').optional().isString(),
  ]),
  refundController.updateRefundStatus
);

module.exports = router;
// routes/v1/revenue.routes.js (Admin Panel)
const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const revenueController = require('../../controllers/revenueController');
const { validateParams } = require('../../middleware/validator');

// TEMPORARY: Remove auth middleware until we confirm it works
// Add authentication later once we verify the import

// Revenue summary for dashboard
router.get('/summary', 
  revenueController.getRevenueSummary
);

// Total revenue with date filters
router.get('/total', 
  validateParams([
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  ]),
  revenueController.getTotalRevenue
);

// Monthly revenue chart
router.get('/monthly', 
  validateParams([
    query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
  ]),
  revenueController.getMonthlyRevenue
);

// Daily revenue chart
router.get('/daily', 
  validateParams([
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be 1-365'),
  ]),
  revenueController.getDailyRevenue
);

// Revenue by category
router.get('/by-category', 
  validateParams([
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ]),
  revenueController.getRevenueByCategory
);

// Export revenue report
router.get('/export', 
  validateParams([
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('format').optional().isIn(['excel', 'pdf']).withMessage('Format must be excel or pdf'),
  ]),
  revenueController.exportRevenueReport
);

module.exports = router;
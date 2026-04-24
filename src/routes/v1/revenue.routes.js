const express = require('express');
const router = express.Router();
const revenueController = require('../../controllers/revenueController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');

router.use(protect);

// Dashboard revenue routes
router.get('/total', checkPermission('reports.view'), revenueController.getTotalRevenue);
router.get('/summary', checkPermission('reports.view'), revenueController.getRevenueSummary);
router.get('/monthly', checkPermission('reports.view'), revenueController.getMonthlyRevenue);
router.get('/daily', checkPermission('reports.view'), revenueController.getDailyRevenue);
router.get('/by-category', checkPermission('reports.view'), revenueController.getRevenueByCategory);

// Create revenue record
router.post('/', checkPermission('reports.manage'), revenueController.createRevenue);

module.exports = router;
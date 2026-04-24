const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboardController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');

router.use(protect);
router.use(checkPermission('dashboard.view'));

router.get('/stats', dashboardController.getStats);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/revenue-chart', dashboardController.getRevenueChart);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/recent-activities', dashboardController.getRecentActivities);
router.get('/real-time-metrics', dashboardController.getRealTimeMetrics);

module.exports = router;
const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/reportController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');

router.use(protect);
router.use(checkPermission('reports.view'));

router.get('/sales', reportController.getSalesReport);
router.get('/products', reportController.getProductsReport);
router.get('/users', reportController.getUsersReport);
router.get('/inventory', reportController.getInventoryReport);
router.get('/sales/export/excel', checkPermission('reports.export'), reportController.exportSalesReportExcel);
router.get('/sales/export/pdf', checkPermission('reports.export'), reportController.exportSalesReportPDF);

module.exports = router;
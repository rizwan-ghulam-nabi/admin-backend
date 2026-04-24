const express = require('express');
const router = express.Router();
const logController = require('../../controllers/logController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');

router.use(protect);
router.use(checkPermission('logs.view'));

router.get('/', logController.getAuditLogs);
router.get('/stats', logController.getLogStats);
router.get('/admin/:adminId', logController.getUserActivity);
router.get('/:id', logController.getLogById);
router.post('/clean', checkPermission('logs.manage'), logController.cleanOldLogs);

module.exports = router;
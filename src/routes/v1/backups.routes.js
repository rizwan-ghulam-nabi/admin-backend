const express = require('express');
const router = express.Router();
const backupController = require('../../controllers/backupController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');

router.use(protect);
router.use(checkPermission('backups.view'));

router.get('/', backupController.listBackups);
router.post('/', checkPermission('backups.create'), backupController.createBackup);
router.get('/:filename', backupController.downloadBackup);
router.post('/:filename/restore', checkPermission('backups.restore'), backupController.restoreBackup);
router.delete('/:filename', checkPermission('backups.manage'), backupController.deleteBackup);

module.exports = router;
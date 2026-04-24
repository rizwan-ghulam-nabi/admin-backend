const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/settingController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validator');
const { settingValidators } = require('../../validators/setting.validator');

router.use(protect);

router.get('/', checkPermission('settings.view'), settingController.getAllSettings);
router.get('/system/info', checkPermission('settings.view'), settingController.getSystemInfo);
router.get('/group/:group', checkPermission('settings.view'), settingController.getSettingsByGroup);
router.get('/:key', checkPermission('settings.view'), settingController.getSetting);

router.put('/',
  checkPermission('settings.update'),
  validate(settingValidators.updateSettings),
  settingController.updateSettings
);

router.put('/:key',
  checkPermission('settings.update'),
  validate(settingValidators.setSetting),
  settingController.setSetting
);

router.delete('/:key',
  checkPermission('settings.manage'),
  settingController.deleteSetting
);

module.exports = router;
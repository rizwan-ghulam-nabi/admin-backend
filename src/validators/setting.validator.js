const { body, param } = require('express-validator');

const settingValidators = {
  updateSettings: [
    body('settings')
      .isObject()
      .withMessage('Settings must be an object'),
  ],
  
  setSetting: [
    param('key')
      .trim()
      .notEmpty()
      .withMessage('Setting key is required'),
    body('value')
      .notEmpty()
      .withMessage('Setting value is required'),
    body('group')
      .optional()
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],
};

module.exports = { settingValidators };
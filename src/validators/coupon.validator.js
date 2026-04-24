const { body, param } = require('express-validator');

const couponValidators = {
  createCoupon: [
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Coupon code is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Coupon code must be between 3 and 50 characters')
      .toUpperCase(),
    body('type')
      .isIn(['percentage', 'fixed'])
      .withMessage('Coupon type must be percentage or fixed'),
    body('value')
      .isFloat({ min: 0 })
      .withMessage('Value must be a positive number'),
    body('minOrderAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum order amount must be a positive number'),
    body('maxUses')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Max uses must be at least 1'),
    body('validFrom')
      .optional()
      .isISO8601()
      .withMessage('Valid from must be a valid date'),
    body('validTo')
      .optional()
      .isISO8601()
      .withMessage('Valid to must be a valid date'),
  ],
  
  updateCoupon: [
    param('id')
      .isMongoId()
      .withMessage('Invalid coupon ID'),
    body('value')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Value must be a positive number'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'expired'])
      .withMessage('Invalid status'),
  ],
};

module.exports = { couponValidators };
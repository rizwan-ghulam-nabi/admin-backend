const { body, param } = require('express-validator');

const categoryValidators = {
  createCategory: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),
    body('parent')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent category ID'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
  ],
  
  updateCategory: [
    param('id')
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),
    body('parent')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent category ID'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Invalid status'),
  ],
};

module.exports = { categoryValidators };
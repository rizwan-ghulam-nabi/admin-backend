const { body, param } = require('express-validator');

const productValidators = {
  createProduct: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Product name must be between 3 and 200 characters'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('category')
      .notEmpty()
      .withMessage('Category is required'),
    body('stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    body('description')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Description cannot exceed 5000 characters'),
  ],
  
  updateProduct: [
    param('id')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Product name must be between 3 and 200 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
  ],
  
  updateStock: [
    param('id')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
  ],
};

module.exports = { productValidators };
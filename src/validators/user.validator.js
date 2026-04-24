const { body, param } = require('express-validator');

const userValidators = {
  createUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['user', 'admin', 'moderator'])
      .withMessage('Invalid role'),
  ],
  
  updateUser: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
  ],
  
  updateUserStatus: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('status')
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('Invalid status'),
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
  ],
};

module.exports = { userValidators };
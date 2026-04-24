// const { body } = require('express-validator');

// const authValidators = {
//   login: [
//     body('email')
//       .isEmail()
//       .normalizeEmail()
//       .withMessage('Valid email is required'),
//     body('password')
//       .notEmpty()
//       .withMessage('Password is required')
//       .isLength({ min: 6 })
//       .withMessage('Password must be at least 6 characters'),
//     body('twoFactorCode')
//       .optional()
//       .isLength({ min: 6, max: 6 })
//       .withMessage('2FA code must be 6 digits')
//       .isNumeric()
//       .withMessage('2FA code must be numeric'),
//   ],
  
//   changePassword: [
//     body('currentPassword')
//       .notEmpty()
//       .withMessage('Current password is required'),
//     body('newPassword')
//       .isLength({ min: 8 })
//       .withMessage('New password must be at least 8 characters')
//       .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
//       .withMessage('Password must contain at least one uppercase, one lowercase, one number, and one special character'),
//   ],
  
//   verify2FA: [
//     body('code')
//       .isLength({ min: 6, max: 6 })
//       .withMessage('2FA code must be 6 digits')
//       .isNumeric()
//       .withMessage('2FA code must be numeric'),
//   ],
  
//   updateProfile: [
//     body('name')
//       .optional()
//       .trim()
//       .isLength({ min: 2, max: 100 })
//       .withMessage('Name must be between 2 and 100 characters'),
//     body('avatar')
//       .optional()
//       .isURL()
//       .withMessage('Avatar must be a valid URL'),
//   ],
// };

// module.exports = { authValidators };






const { body } = require('express-validator');

const authValidators = {
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('twoFactorCode')
      .optional()
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA code must be 6 digits')
      .isNumeric()
      .withMessage('2FA code must be numeric'),
  ],

  // ============================================
  // ✅ ADD THESE OTP VALIDATORS
  // ============================================
  verifyOTP: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must be numeric'),
    body('tempToken')
      .notEmpty()
      .withMessage('Temporary token is required'),
  ],

  resendOTP: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
  ],

  verify2FALogin: [
    body('twoFactorCode')
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA code must be 6 digits')
      .isNumeric()
      .withMessage('2FA code must be numeric'),
    body('tempToken')
      .notEmpty()
      .withMessage('Temporary token is required'),
  ],
  // ============================================
  // END OTP VALIDATORS
  // ============================================
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase, one lowercase, one number, and one special character'),
  ],
  
  verify2FA: [
    body('code')
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA code must be 6 digits')
      .isNumeric()
      .withMessage('2FA code must be numeric'),
  ],
  
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
  ],
};

module.exports = { authValidators };
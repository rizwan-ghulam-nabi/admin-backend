
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { protect } = require('../../middleware/auth');
const { authValidators } = require('../../validators/auth.validator');

// If you have a validation middleware, import it
// const validate = require('../../middleware/validator'); // Adjust path as needed

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.post('/login', authValidators.login, authController.login);
router.post('/verify-otp', authValidators.verifyOTP, authController.verifyOTP);           // ✅ ADD
router.post('/resend-otp', authValidators.resendOTP, authController.resendOTP);           // ✅ ADD
router.post('/verify-2fa-login', authValidators.verify2FALogin, authController.verify2FALogin); // ✅ ADD
router.post('/refresh-token', authController.refreshToken);

// Forgot Password
router.post('/forgot-password', authController.forgotPassword);

// Reset Password
router.post('/reset-password', authController.resetPassword);

// ============================================

// PROTECTED ROUTES (Authentication required)
// ============================================
router.use(protect);

router.post('/logout', authController.logout);
router.post('/change-password', authValidators.changePassword, authController.changePassword);
router.get('/profile', authController.getProfile);
router.put('/profile', authValidators.updateProfile, authController.updateProfile);
router.post('/enable-2fa', authController.enable2FA);
router.post('/verify-2fa', authValidators.verify2FA, authController.verify2FA);
router.post('/disable-2fa', authValidators.verify2FA, authController.disable2FA);





module.exports = router;
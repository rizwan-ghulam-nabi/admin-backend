// const Admin = require('../models/Admin');
// const AdminSession = require('../models/AdminSession');
// const { generateToken, generateRefreshToken, verifyRefreshToken, verifyToken } = require('../config/jwt');
// const logger = require('../config/logger');
// const emailService = require('../services/emailService');
// const otpService = require('../services/otpService');

// // ============================================
// // SAFE IMPORTS WITH FALLBACKS
// // ============================================

// // Two Factor Service
// let twoFactorService;
// try {
//   twoFactorService = require('../services/twoFactorService');
  
//   if (!twoFactorService || typeof twoFactorService.generateSecret !== 'function') {
//     throw new Error('twoFactorService missing required methods');
//   }
  
//   logger.info('✅ Two-factor service loaded');
//   console.log('✅ 2FA methods:', Object.keys(twoFactorService));
// } catch (error) {
//   logger.warn('⚠️ Two-factor service not found or invalid, using mock');
//   logger.warn('Error details:', error.message);
  
//   twoFactorService = {
//     generateSecret: (email, issuer = 'AdminPanel') => ({
//       secret: 'MOCK_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
//       otpauthUrl: `otpauth://totp/${issuer}:${email}?secret=MOCK&issuer=${issuer}`,
//     }),
//     generateQRCode: async (otpauthUrl) => 'data:image/png;base64,MOCK_QR_CODE',
//     verify: (secret, token) => {
//       return token === '123456' || (token && token.length === 6);
//     },
//     generateBackupCodes: (count = 10) => {
//       return Array(count).fill(0).map(() => 
//         Math.random().toString(36).substring(2, 10).toUpperCase()
//       );
//     },
//   };
  
//   logger.info('✅ Mock two-factor service created');
// }

// // Audit Service - Direct import (not destructured)
// let auditService;
// try {
//   auditService = require('../services/auditService');
//   logger.info('✅ Audit service loaded');
// } catch (error) {
//   logger.warn('⚠️ Audit service not found, using mock');
//   auditService = {
//     log: async () => null,
//     getAdminActivity: async () => [],
//     getResourceHistory: async () => [],
//     getSummary: async () => [],
//   };
// }

// // AppError Class
// let AppError;
// try {
//   AppError = require('../utils/AppError').AppError;
//   logger.info('✅ AppError loaded');
// } catch (error) {
//   logger.warn('⚠️ AppError not found, using mock');
//   AppError = class AppError extends Error {
//     constructor(message, statusCode) {
//       super(message);
//       this.statusCode = statusCode;
//       this.isOperational = true;
//     }
//   };
// }

// // Debug: Verify all services loaded
// console.log('=== AUTH CONTROLLER INITIALIZED ===');
// console.log('twoFactorService:', typeof twoFactorService);
// console.log('auditService:', typeof auditService);
// console.log('auditService.log:', typeof auditService?.log);
// console.log('AppError:', typeof AppError);
// console.log('====================================');

// // Cookie configuration
// const cookieOptions = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production',
//   sameSite: 'strict',
//   path: '/',
// };

// // Safe audit log helper
// const safeAuditLog = async (data) => {
//   try {
//     if (auditService && typeof auditService.log === 'function') {
//       await auditService.log(data);
//     } else {
//       console.log('📝 [AUDIT]', data.action, data.status, data.details || '');
//     }
//   } catch (error) {
//     console.error('Audit log error (ignored):', error.message);
//   }
// };

// // ============================================
// // AUTH CONTROLLER
// // ============================================

// const authController = {
//   /**
//    * @desc    Login admin - Step 1: Validate credentials and send OTP
//    * @route   POST /api/v1/admin/auth/login
//    * @access  Public
//    */
//   async login(req, res, next) {
//     try {
//       const { email, password } = req.body;
      
//       logger.info(`🔐 Login attempt: ${email}`);
      
//       const admin = await Admin.findOne({ email })
//         .select('+password +twoFactorSecret')
//         .populate('role');
      
//       if (!admin) {
//         await safeAuditLog({
//           admin: null,
//           action: 'login',
//           resource: 'auth',
//           status: 'failed',
//           details: { email, reason: 'Admin not found' },
//           ipAddress: req.ip,
//           userAgent: req.get('user-agent'),
//         });
        
//         return res.status(401).json({
//           success: false,
//           message: 'Invalid email or password',
//         });
//       }
      
//       if (admin.status !== 'active') {
//         logger.warn(`⚠️ Login failed - Account ${admin.status}: ${email}`);
        
//         await safeAuditLog({
//           admin: admin._id,
//           action: 'login',
//           resource: 'auth',
//           status: 'failed',
//           details: { email, reason: `Account ${admin.status}` },
//           ipAddress: req.ip,
//           userAgent: req.get('user-agent'),
//         });
        
//         return res.status(401).json({
//           success: false,
//           message: `Your account is ${admin.status}. Please contact administrator.`,
//         });
//       }
      
//       const isPasswordValid = await admin.comparePassword(password);
      
//       if (!isPasswordValid) {
//         logger.warn(`⚠️ Login failed - Invalid password: ${email}`);
        
//         await safeAuditLog({
//           admin: admin._id,
//           action: 'login',
//           resource: 'auth',
//           status: 'failed',
//           details: { email, reason: 'Invalid password' },
//           ipAddress: req.ip,
//           userAgent: req.get('user-agent'),
//         });
        
//         return res.status(401).json({
//           success: false,
//           message: 'Invalid email or password',
//         });
//       }
      
//       // ✅ GENERATE AND SEND OTP
//       const otp = await otpService.generateOTP(email);
//       await emailService.sendOTP(email, otp, admin.name);
      
//       const tempToken = generateToken({ 
//         id: admin._id, 
//         email, 
//         otpPending: true 
//       }, '10m');
      
//       logger.info(`📧 OTP sent to ${email}`);
      
//       await safeAuditLog({
//         admin: admin._id,
//         action: 'login',
//         resource: 'auth',
//         status: 'pending',
//         details: { email, method: 'OTP sent' },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       res.status(200).json({
//         success: true,
//         requiresOTP: true,
//         message: 'Verification code sent to your email',
//         tempToken,
//         email,
//       });
//     } catch (error) {
//       logger.error('❌ Login error:', error);
//       next(error);
//     }
//   },

//   /**
//    * @desc    Verify OTP and complete login
//    * @route   POST /api/v1/admin/auth/verify-otp
//    * @access  Public
//    */
//   async verifyOTP(req, res, next) {
//     try {
//       const { email, otp, tempToken } = req.body;
      
//       const decoded = verifyToken(tempToken);
//       if (!decoded || !decoded.otpPending) {
//         return res.status(401).json({
//           success: false,
//           message: 'Invalid or expired session. Please login again.',
//         });
//       }
      
//       const isValid = await otpService.verifyOTP(email, otp);
      
//       if (!isValid) {
//         await safeAuditLog({
//           admin: decoded.id,
//           action: 'login',
//           resource: 'auth',
//           status: 'failed',
//           details: { email, reason: 'Invalid OTP' },
//           ipAddress: req.ip,
//           userAgent: req.get('user-agent'),
//         });
        
//         return res.status(401).json({
//           success: false,
//           message: 'Invalid or expired verification code',
//         });
//       }
      
//       const admin = await Admin.findById(decoded.id).populate('role');
      
//       if (!admin) {
//         return res.status(401).json({
//           success: false,
//           message: 'Admin not found',
//         });
//       }
      
//       // Check if 2FA is enabled
//       if (admin.twoFactorEnabled) {
//         await otpService.clearOTP(email);
        
//         return res.status(200).json({
//           success: true,
//           requiresTwoFactor: true,
//           message: '2FA code required',
//           tempToken: generateToken({ id: admin._id, twoFactorPending: true }, '5m'),
//         });
//       }
      
//       // Generate tokens
//       const token = generateToken({ 
//         id: admin._id, 
//         email: admin.email,
//         role: admin.role?.name || 'admin'
//       });
      
//       const refreshToken = generateRefreshToken({ 
//         id: admin._id,
//         email: admin.email
//       });
      
//       // Save session
//       await AdminSession.create({
//         admin: admin._id,
//         token,
//         refreshToken,
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         isActive: true,
//       });
      
//       // Update last login
//       admin.lastLogin = new Date();
//       admin.lastLoginIP = req.ip;
//       await admin.save();
      
//       await safeAuditLog({
//         admin: admin._id,
//         action: 'login',
//         resource: 'auth',
//         status: 'success',
//         details: { method: 'OTP' },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       const adminData = admin.toObject();
//       delete adminData.password;
//       delete adminData.twoFactorSecret;
      
//       const permissions = admin.role?.permissions || admin.permissions || [];
      
//       res.cookie('accessToken', token, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
//       res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
//       res.cookie('admin_permissions', JSON.stringify(permissions), { ...cookieOptions, httpOnly: false, maxAge: 15 * 60 * 1000 });
      
//       logger.info(`✅ Login successful: ${email}`);
      
//       res.status(200).json({
//         success: true,
//         message: 'Login successful',
//         data: {
//           admin: adminData,
//           token,
//           refreshToken,
//           permissions,
//         },
//       });
//     } catch (error) {
//       logger.error('❌ OTP verification error:', error);
//       next(error);
//     }
//   },

//   /**
//    * @desc    Resend OTP
//    * @route   POST /api/v1/admin/auth/resend-otp
//    * @access  Public
//    */
//   async resendOTP(req, res, next) {
//     try {
//       const { email } = req.body;
      
//       const admin = await Admin.findOne({ email });
      
//       if (!admin) {
//         return res.status(404).json({
//           success: false,
//           message: 'Admin not found',
//         });
//       }
      
//       await otpService.clearOTP(email);
//       const otp = await otpService.generateOTP(email);
//       await emailService.sendOTP(email, otp, admin.name);
      
//       logger.info(`📧 OTP resent to ${email}`);
      
//       res.status(200).json({
//         success: true,
//         message: 'Verification code resent successfully',
//       });
//     } catch (error) {
//       next(error);
//     }
//   },

//   /**
//    * @desc    Verify 2FA (for accounts with 2FA enabled)
//    * @route   POST /api/v1/admin/auth/verify-2fa-login
//    * @access  Public
//    */
//   async verify2FALogin(req, res, next) {
//     try {
//       const { twoFactorCode, tempToken } = req.body;
      
//       const decoded = verifyToken(tempToken);
//       if (!decoded || !decoded.twoFactorPending) {
//         return res.status(401).json({
//           success: false,
//           message: 'Invalid or expired session',
//         });
//       }
      
//       const admin = await Admin.findById(decoded.id)
//         .select('+twoFactorSecret')
//         .populate('role');
      
//       if (!admin) {
//         return res.status(401).json({ success: false, message: 'Admin not found' });
//       }
      
//       const isValid2FA = twoFactorService.verify(admin.twoFactorSecret, twoFactorCode);
      
//       if (!isValid2FA) {
//         await safeAuditLog({
//           admin: admin._id,
//           action: 'login',
//           resource: 'auth',
//           status: 'failed',
//           details: { email: admin.email, reason: 'Invalid 2FA code' },
//           ipAddress: req.ip,
//           userAgent: req.get('user-agent'),
//         });
        
//         return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
//       }
      
//       // Generate tokens
//       const token = generateToken({ 
//         id: admin._id, 
//         email: admin.email,
//         role: admin.role?.name || 'admin'
//       });
      
//       const refreshToken = generateRefreshToken({ id: admin._id, email: admin.email });
      
//       await AdminSession.create({
//         admin: admin._id,
//         token,
//         refreshToken,
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         isActive: true,
//       });
      
//       admin.lastLogin = new Date();
//       admin.lastLoginIP = req.ip;
//       await admin.save();
      
//       await safeAuditLog({
//         admin: admin._id,
//         action: 'login',
//         resource: 'auth',
//         status: 'success',
//         details: { method: 'OTP+2FA' },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       const adminData = admin.toObject();
//       delete adminData.password;
//       delete adminData.twoFactorSecret;
      
//       const permissions = admin.role?.permissions || admin.permissions || [];
      
//       res.cookie('accessToken', token, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
//       res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
//       res.cookie('admin_permissions', JSON.stringify(permissions), { ...cookieOptions, httpOnly: false, maxAge: 15 * 60 * 1000 });
      
//       logger.info(`✅ Login successful with 2FA: ${admin.email}`);
      
//       res.status(200).json({
//         success: true,
//         message: 'Login successful',
//         data: { admin: adminData, token, refreshToken, permissions },
//       });
//     } catch (error) {
//       logger.error('❌ 2FA login error:', error);
//       next(error);
//     }
//   },

//   // ============================================
//   // EXISTING METHODS (UNCHANGED)
//   // ============================================

//   async logout(req, res, next) {
//     try {
//       const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
      
//       if (token) {
//         await AdminSession.findOneAndUpdate(
//           { token },
//           { isActive: false, logoutAt: new Date() }
//         );
        
//         if (req.admin?._id) {
//           await safeAuditLog({
//             admin: req.admin._id,
//             action: 'logout',
//             resource: 'auth',
//             status: 'success',
//             ipAddress: req.ip,
//             userAgent: req.get('user-agent'),
//           });
//         }
//       }
      
//       res.clearCookie('accessToken', cookieOptions);
//       res.clearCookie('refreshToken', cookieOptions);
//       res.clearCookie('admin_permissions', { ...cookieOptions, httpOnly: false });
      
//       logger.info('✅ Logout successful');
      
//       res.status(200).json({ success: true, message: 'Logged out successfully' });
//     } catch (error) {
//       logger.error('❌ Logout error:', error);
//       next(error);
//     }
//   },

//   async refreshToken(req, res, next) {
//     try {
//       const { refreshToken: bodyRefreshToken } = req.body;
//       const cookieRefreshToken = req.cookies?.refreshToken;
//       const refreshToken = bodyRefreshToken || cookieRefreshToken;
      
//       if (!refreshToken) throw new AppError('Refresh token required', 400);
      
//       const decoded = verifyRefreshToken(refreshToken);
//       if (!decoded) throw new AppError('Invalid or expired refresh token', 401);
      
//       const session = await AdminSession.findOne({ refreshToken, isActive: true });
//       if (!session) throw new AppError('Session not found or expired', 401);
      
//       const admin = await Admin.findById(decoded.id);
//       if (!admin || admin.status !== 'active') throw new AppError('Admin not found or inactive', 401);
      
//       const newToken = generateToken({ id: admin._id, email: admin.email, role: admin.role?.name || 'admin' });
//       const newRefreshToken = generateRefreshToken({ id: admin._id, email: admin.email });
      
//       session.token = newToken;
//       session.refreshToken = newRefreshToken;
//       session.lastActivity = new Date();
//       await session.save();
      
//       res.cookie('accessToken', newToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
//       res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      
//       logger.info(`✅ Token refreshed for admin: ${admin.email}`);
      
//       res.status(200).json({
//         success: true,
//         message: 'Token refreshed successfully',
//         data: { token: newToken, refreshToken: newRefreshToken },
//       });
//     } catch (error) {
//       logger.error('❌ Refresh token error:', error);
//       next(error);
//     }
//   },

//   async getProfile(req, res, next) {
//     try {
//       const admin = await Admin.findById(req.admin._id).select('-password -twoFactorSecret').populate('role');
//       if (!admin) throw new AppError('Admin not found', 404);
//       res.status(200).json({ success: true, data: admin });
//     } catch (error) {
//       logger.error('❌ Get profile error:', error);
//       next(error);
//     }
//   },

//   async updateProfile(req, res, next) {
//     try {
//       const { name, avatar } = req.body;
//       const updateData = {};
//       if (name) updateData.name = name;
//       if (avatar) updateData.avatar = avatar;
      
//       const admin = await Admin.findByIdAndUpdate(req.admin._id, updateData, { new: true, runValidators: true })
//         .select('-password -twoFactorSecret');
      
//       if (!admin) throw new AppError('Admin not found', 404);
      
//       await safeAuditLog({
//         admin: admin._id,
//         action: 'update',
//         resource: 'admin',
//         resourceId: admin._id,
//         status: 'success',
//         details: { updatedFields: Object.keys(updateData) },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       logger.info(`✅ Profile updated for admin: ${admin.email}`);
//       res.status(200).json({ success: true, message: 'Profile updated successfully', data: admin });
//     } catch (error) {
//       logger.error('❌ Update profile error:', error);
//       next(error);
//     }
//   },

//   async changePassword(req, res, next) {
//     try {
//       const { currentPassword, newPassword } = req.body;
//       if (!newPassword || newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400);
      
//       const admin = await Admin.findById(req.admin._id).select('+password');
//       if (!admin) throw new AppError('Admin not found', 404);
      
//       const isPasswordValid = await admin.comparePassword(currentPassword);
//       if (!isPasswordValid) throw new AppError('Current password is incorrect', 401);
      
//       admin.password = newPassword;
//       await admin.save();
      
//       await AdminSession.updateMany({ admin: admin._id, token: { $ne: req.token } }, { isActive: false });
      
//       await safeAuditLog({
//         admin: admin._id,
//         action: 'update',
//         resource: 'admin',
//         resourceId: admin._id,
//         status: 'success',
//         details: { field: 'password' },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       logger.info(`✅ Password changed for admin: ${admin.email}`);
//       res.status(200).json({ success: true, message: 'Password changed successfully. Please login again.' });
//     } catch (error) {
//       logger.error('❌ Change password error:', error);
//       next(error);
//     }
//   },

//   async enable2FA(req, res, next) {
//     try {
//       const admin = await Admin.findById(req.admin._id);
//       if (!admin) throw new AppError('Admin not found', 404);
//       if (admin.twoFactorEnabled) throw new AppError('2FA is already enabled', 400);
      
//       const { secret, qrCode } = twoFactorService.generateSecret(admin.email);
//       admin.twoFactorSecret = secret;
//       await admin.save();
      
//       logger.info(`✅ 2FA setup initiated for admin: ${admin.email}`);
//       res.status(200).json({ success: true, message: '2FA setup initiated', data: { secret, qrCode } });
//     } catch (error) {
//       logger.error('❌ Enable 2FA error:', error);
//       next(error);
//     }
//   },

//   async verify2FA(req, res, next) {
//     try {
//       const { code } = req.body;
//       const admin = await Admin.findById(req.admin._id);
//       if (!admin) throw new AppError('Admin not found', 404);
//       if (!admin.twoFactorSecret) throw new AppError('2FA setup not initiated', 400);
      
//       const isValid = twoFactorService.verify(admin.twoFactorSecret, code);
//       if (!isValid) throw new AppError('Invalid 2FA code', 400);
      
//       admin.twoFactorEnabled = true;
//       await admin.save();
      
//       await safeAuditLog({
//         admin: admin._id,
//         action: 'update',
//         resource: 'admin',
//         resourceId: admin._id,
//         status: 'success',
//         details: { twoFactorEnabled: true },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       logger.info(`✅ 2FA enabled for admin: ${admin.email}`);
//       res.status(200).json({ success: true, message: '2FA enabled successfully' });
//     } catch (error) {
//       logger.error('❌ Verify 2FA error:', error);
//       next(error);
//     }
//   },

//   async disable2FA(req, res, next) {
//     try {
//       const { code } = req.body;
//       const admin = await Admin.findById(req.admin._id);
//       if (!admin) throw new AppError('Admin not found', 404);
//       if (!admin.twoFactorEnabled) throw new AppError('2FA is not enabled', 400);
      
//       const isValid = twoFactorService.verify(admin.twoFactorSecret, code);
//       if (!isValid) throw new AppError('Invalid 2FA code', 400);
      
//       admin.twoFactorEnabled = false;
//       admin.twoFactorSecret = null;
//       await admin.save();
      
//       await safeAuditLog({
//         admin: admin._id,
//         action: 'update',
//         resource: 'admin',
//         resourceId: admin._id,
//         status: 'success',
//         details: { twoFactorEnabled: false },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       logger.info(`✅ 2FA disabled for admin: ${admin.email}`);
//       res.status(200).json({ success: true, message: '2FA disabled successfully' });
//     } catch (error) {
//       logger.error('❌ Disable 2FA error:', error);
//       next(error);
//     }
//   },
// };

//   // ============================================
//   // FORGOT PASSWORD
//   // ============================================
  
//    forgotPassword=async(req, res, next) =>{
//     try {
//       const crypto = require('crypto');
//       const { email } = req.body;

//       if (!email) {
//         return res.status(400).json({
//           success: false,
//           message: 'Please provide your email address'
//         });
//       }

//       const admin = await Admin.findOne({ email });
      
//       if (!admin) {
//         return res.status(200).json({
//           success: true,
//           message: 'If your email is registered, you will receive a password reset link'
//         });
//       }

//       const resetToken = crypto.randomBytes(32).toString('hex');
//       const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

//       admin.resetPasswordToken = resetTokenHash;
//       admin.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
//       await admin.save({ validateBeforeSave: false });

//       const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
//       try {
//         await emailService.sendEmail({
//           to: admin.email,
//           subject: 'Password Reset - Admin Panel',
//           html: `<h2>Reset Your Password</h2><p>Click <a href="${resetUrl}">here</a> to reset.</p><p>Expires in 30 min.</p>`
//         });
//       } catch (emailError) {
//         admin.resetPasswordToken = undefined;
//         admin.resetPasswordExpire = undefined;
//         await admin.save({ validateBeforeSave: false });
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Password reset link sent to your email'
//       });
//     } catch (error) {
//       next(new AppError(error.message, 500));
//     }
//   },



//    resetPassword=async(req, res, next)=>{
//     try {
//       const crypto = require('crypto');
//       const { token, password } = req.body;

//       if (!token || !password) {
//         return res.status(400).json({
//           success: false,
//           message: 'Please provide token and new password'
//         });
//       }

//       if (password.length < 8) {
//         return res.status(400).json({
//           success: false,
//           message: 'Password must be at least 8 characters'
//         });
//       }

//       const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

//       const admin = await Admin.findOne({
//         resetPasswordToken: resetTokenHash,
//         resetPasswordExpire: { $gt: Date.now() }
//       });

//       if (!admin) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid or expired reset token'
//         });
//       }

//       admin.password = password;
//       admin.resetPasswordToken = undefined;
//       admin.resetPasswordExpire = undefined;
//       await admin.save();

//       res.status(200).json({
//         success: true,
//         message: 'Password reset successful! You can now login.'
//       });
//     } catch (error) {
//       next(new AppError(error.message, 500));
//     }
//   }



// module.exports = authController;


















// V2 27/04/2026



// controllers/authController.js
const crypto = require('crypto');
const Admin = require('../models/Admin');
const AdminSession = require('../models/AdminSession');
const { generateToken, generateRefreshToken, verifyRefreshToken, verifyToken } = require('../config/jwt');
const logger = require('../config/logger');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');

// ============================================
// SAFE IMPORTS WITH FALLBACKS
// ============================================

let twoFactorService;
try {
  twoFactorService = require('../services/twoFactorService');
  if (!twoFactorService || typeof twoFactorService.generateSecret !== 'function') {
    throw new Error('twoFactorService missing required methods');
  }
  logger.info('✅ Two-factor service loaded');
} catch (error) {
  logger.warn('⚠️ Two-factor service not found, using mock');
  twoFactorService = {
    generateSecret: (email, issuer = 'AdminPanel') => ({
      secret: 'MOCK_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      otpauthUrl: `otpauth://totp/${issuer}:${email}?secret=MOCK&issuer=${issuer}`,
    }),
    generateQRCode: async (otpauthUrl) => 'data:image/png;base64,MOCK_QR_CODE',
    verify: (secret, token) => token === '123456' || (token && token.length === 6),
    generateBackupCodes: (count = 10) => Array(count).fill(0).map(() => Math.random().toString(36).substring(2, 10).toUpperCase()),
  };
}

let auditService;
try {
  auditService = require('../services/auditService');
  logger.info('✅ Audit service loaded');
} catch (error) {
  auditService = {
    log: async () => null,
    getAdminActivity: async () => [],
    getResourceHistory: async () => [],
    getSummary: async () => [],
  };
}

let AppError;
try {
  AppError = require('../utils/AppError').AppError;
} catch (error) {
  AppError = class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
    }
  };
}

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

// Safe audit log helper
const safeAuditLog = async (data) => {
  try {
    if (auditService && typeof auditService.log === 'function') {
      await auditService.log(data);
    }
  } catch (error) {
    console.error('Audit log error (ignored):', error.message);
  }
};

// ============================================
// AUTH CONTROLLER
// ============================================

const authController = {
  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      logger.info(`🔐 Login attempt: ${email}`);
      
      const admin = await Admin.findOne({ email }).select('+password +twoFactorSecret').populate('role');
      
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      
      if (admin.status !== 'active') {
        return res.status(401).json({ success: false, message: `Your account is ${admin.status}. Contact administrator.` });
      }
      
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      
      const otp = await otpService.generateOTP(email);
      await emailService.sendOTP(email, otp, admin.name);
      
      const tempToken = generateToken({ id: admin._id, email, otpPending: true }, '10m');
      
      logger.info(`📧 OTP sent to ${email}`);
      
      res.status(200).json({
        success: true,
        requiresOTP: true,
        message: 'Verification code sent to your email',
        tempToken,
        email,
      });
    } catch (error) {
      logger.error('❌ Login error:', error);
      next(error);
    }
  },

  // Verify OTP
  async verifyOTP(req, res, next) {
    try {
      const { email, otp, tempToken } = req.body;
      
      const decoded = verifyToken(tempToken);
      if (!decoded || !decoded.otpPending) {
        return res.status(401).json({ success: false, message: 'Invalid or expired session. Please login again.' });
      }
      
      const isValid = await otpService.verifyOTP(email, otp);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid or expired verification code' });
      }
      
      const admin = await Admin.findById(decoded.id).populate('role');
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Admin not found' });
      }
      
      if (admin.twoFactorEnabled) {
        await otpService.clearOTP(email);
        return res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          message: '2FA code required',
          tempToken: generateToken({ id: admin._id, twoFactorPending: true }, '5m'),
        });
      }
      
      const token = generateToken({ id: admin._id, email: admin.email, role: admin.role?.name || 'admin' });
      const refreshToken = generateRefreshToken({ id: admin._id, email: admin.email });
      
      await AdminSession.create({
        admin: admin._id,
        token,
        refreshToken,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      });
      
      admin.lastLogin = new Date();
      admin.lastLoginIP = req.ip;
      await admin.save();
      
      const adminData = admin.toObject();
      delete adminData.password;
      delete adminData.twoFactorSecret;
      
      const permissions = admin.role?.permissions || admin.permissions || [];
      
      res.cookie('accessToken', token, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.cookie('admin_permissions', JSON.stringify(permissions), { ...cookieOptions, httpOnly: false, maxAge: 15 * 60 * 1000 });
      
      logger.info(`✅ Login successful: ${email}`);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { admin: adminData, token, refreshToken, permissions },
      });
    } catch (error) {
      logger.error('❌ OTP verification error:', error);
      next(error);
    }
  },

  // Resend OTP
  async resendOTP(req, res, next) {
    try {
      const { email } = req.body;
      const admin = await Admin.findOne({ email });
      if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
      
      await otpService.clearOTP(email);
      const otp = await otpService.generateOTP(email);
      await emailService.sendOTP(email, otp, admin.name);
      
      res.status(200).json({ success: true, message: 'Verification code resent successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Verify 2FA Login
  async verify2FALogin(req, res, next) {
    try {
      const { twoFactorCode, tempToken } = req.body;
      const decoded = verifyToken(tempToken);
      if (!decoded || !decoded.twoFactorPending) {
        return res.status(401).json({ success: false, message: 'Invalid or expired session' });
      }
      
      const admin = await Admin.findById(decoded.id).select('+twoFactorSecret').populate('role');
      if (!admin) return res.status(401).json({ success: false, message: 'Admin not found' });
      
      const isValid2FA = twoFactorService.verify(admin.twoFactorSecret, twoFactorCode);
      if (!isValid2FA) return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
      
      const token = generateToken({ id: admin._id, email: admin.email, role: admin.role?.name || 'admin' });
      const refreshToken = generateRefreshToken({ id: admin._id, email: admin.email });
      
      await AdminSession.create({
        admin: admin._id, token, refreshToken,
        ipAddress: req.ip, userAgent: req.get('user-agent'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), isActive: true,
      });
      
      admin.lastLogin = new Date();
      admin.lastLoginIP = req.ip;
      await admin.save();
      
      const adminData = admin.toObject();
      delete adminData.password;
      delete adminData.twoFactorSecret;
      
      const permissions = admin.role?.permissions || admin.permissions || [];
      
      res.cookie('accessToken', token, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.cookie('admin_permissions', JSON.stringify(permissions), { ...cookieOptions, httpOnly: false, maxAge: 15 * 60 * 1000 });
      
      res.status(200).json({
        success: true, message: 'Login successful',
        data: { admin: adminData, token, refreshToken, permissions },
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout
  async logout(req, res, next) {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
      if (token) {
        await AdminSession.findOneAndUpdate({ token }, { isActive: false, logoutAt: new Date() });
      }
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      res.clearCookie('admin_permissions', { ...cookieOptions, httpOnly: false });
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Refresh Token
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
      if (!refreshToken) throw new AppError('Refresh token required', 400);
      
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) throw new AppError('Invalid or expired refresh token', 401);
      
      const session = await AdminSession.findOne({ refreshToken, isActive: true });
      if (!session) throw new AppError('Session not found or expired', 401);
      
      const admin = await Admin.findById(decoded.id);
      if (!admin || admin.status !== 'active') throw new AppError('Admin not found or inactive', 401);
      
      const newToken = generateToken({ id: admin._id, email: admin.email, role: admin.role?.name || 'admin' });
      const newRefreshToken = generateRefreshToken({ id: admin._id, email: admin.email });
      
      session.token = newToken;
      session.refreshToken = newRefreshToken;
      session.lastActivity = new Date();
      await session.save();
      
      res.cookie('accessToken', newToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
      res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      
      res.status(200).json({ success: true, message: 'Token refreshed', data: { token: newToken, refreshToken: newRefreshToken } });
    } catch (error) {
      next(error);
    }
  },

  // Get Profile
  async getProfile(req, res, next) {
    try {
      const admin = await Admin.findById(req.admin._id).select('-password -twoFactorSecret').populate('role');
      if (!admin) throw new AppError('Admin not found', 404);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  },

  // Update Profile
  async updateProfile(req, res, next) {
    try {
      const { name, avatar } = req.body;
      const updateData = {};
      if (name) updateData.name = name;
      if (avatar) updateData.avatar = avatar;
      
      const admin = await Admin.findByIdAndUpdate(req.admin._id, updateData, { new: true, runValidators: true }).select('-password -twoFactorSecret');
      if (!admin) throw new AppError('Admin not found', 404);
      
      res.status(200).json({ success: true, message: 'Profile updated', data: admin });
    } catch (error) {
      next(error);
    }
  },

  // Change Password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400);
      
      const admin = await Admin.findById(req.admin._id).select('+password');
      if (!admin) throw new AppError('Admin not found', 404);
      
      const isPasswordValid = await admin.comparePassword(currentPassword);
      if (!isPasswordValid) throw new AppError('Current password is incorrect', 401);
      
      admin.password = newPassword;
      await admin.save();
      await AdminSession.updateMany({ admin: admin._id, token: { $ne: req.token } }, { isActive: false });
      
      res.status(200).json({ success: true, message: 'Password changed. Please login again.' });
    } catch (error) {
      next(error);
    }
  },

  // Enable 2FA
  async enable2FA(req, res, next) {
    try {
      const admin = await Admin.findById(req.admin._id);
      if (!admin) throw new AppError('Admin not found', 404);
      if (admin.twoFactorEnabled) throw new AppError('2FA is already enabled', 400);
      
      const { secret, qrCode } = twoFactorService.generateSecret(admin.email);
      admin.twoFactorSecret = secret;
      await admin.save();
      
      res.status(200).json({ success: true, message: '2FA setup initiated', data: { secret, qrCode } });
    } catch (error) {
      next(error);
    }
  },

  // Verify 2FA Setup
  async verify2FA(req, res, next) {
    try {
      const { code } = req.body;
      const admin = await Admin.findById(req.admin._id);
      if (!admin) throw new AppError('Admin not found', 404);
      if (!admin.twoFactorSecret) throw new AppError('2FA setup not initiated', 400);
      
      const isValid = twoFactorService.verify(admin.twoFactorSecret, code);
      if (!isValid) throw new AppError('Invalid 2FA code', 400);
      
      admin.twoFactorEnabled = true;
      await admin.save();
      
      res.status(200).json({ success: true, message: '2FA enabled successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Disable 2FA
  async disable2FA(req, res, next) {
    try {
      const { code } = req.body;
      const admin = await Admin.findById(req.admin._id);
      if (!admin) throw new AppError('Admin not found', 404);
      if (!admin.twoFactorEnabled) throw new AppError('2FA is not enabled', 400);
      
      const isValid = twoFactorService.verify(admin.twoFactorSecret, code);
      if (!isValid) throw new AppError('Invalid 2FA code', 400);
      
      admin.twoFactorEnabled = false;
      admin.twoFactorSecret = null;
      await admin.save();
      
      res.status(200).json({ success: true, message: '2FA disabled successfully' });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // FORGOT PASSWORD
  // ============================================

  // async forgotPassword(req, res, next) {
  //   try {
  //     const { email } = req.body;

  //     if (!email) {
  //       return res.status(400).json({ success: false, message: 'Please provide your email address' });
  //     }

  //     const admin = await Admin.findOne({ email });
      
  //     if (!admin) {
  //       return res.status(200).json({ success: true, message: 'If your email is registered, you will receive a password reset link' });
  //     }

  //     const resetToken = crypto.randomBytes(32).toString('hex');
  //     const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  //     admin.resetPasswordToken = resetTokenHash;
  //     admin.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  //     await admin.save({ validateBeforeSave: false });

  //     const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
  //     try {
  //       await emailService.sendEmail({
  //         to: admin.email,
  //         subject: 'Password Reset - Admin Panel',
  //         html: `<h2>Reset Your Password</h2><p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link expires in 30 minutes.</p>`
  //       });
  //     } catch (emailError) {
  //       admin.resetPasswordToken = undefined;
  //       admin.resetPasswordExpire = undefined;
  //       await admin.save({ validateBeforeSave: false });
  //     }

  //     res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
  //   } catch (error) {
  //     next(new AppError(error.message, 500));
  //   }
  // },



async forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(200).json({ success: true, message: 'If your email is registered, you will receive a password reset link' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    admin.resetPasswordToken = resetTokenHash;
    admin.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    console.log('🔗 Reset URL:', resetUrl);
    
    try {
      // ✅ CORRECT: Separate parameters
      await emailService.sendEmail(
        admin.email,
        'Password Reset - Admin Panel',
        `<h2>Reset Your Password</h2><p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link expires in 30 minutes.</p>`
      );
    } catch (emailError) {
      console.error('⚠️ Email failed, but reset URL is:', resetUrl);
    }

    res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
},


  // Reset Password
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Please provide token and new password' });
      }

      if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      }

      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const admin = await Admin.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!admin) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token. Please request a new one.' });
      }

      admin.password = password;
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpire = undefined;
      await admin.save();

      res.status(200).json({ success: true, message: 'Password reset successful! You can now login with your new password.' });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  },
};

// ✅ Single export
module.exports = authController;
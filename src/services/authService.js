const Admin = require('../models/Admin');
const AdminRole = require('../models/AdminRole');
const AdminSession = require('../models/AdminSession');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const { AppError } = require('../utils/AppError');
const crypto = require('crypto');

class AuthService {
  async validateAdmin(email, password) {
    const admin = await Admin.findOne({ email }).select('+password').populate('role');
    
    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }
    
    const isValid = await admin.comparePassword(password);
    
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }
    
    if (admin.status !== 'active') {
      throw new AppError(`Account is ${admin.status}`, 401);
    }
    
    return admin;
  }
  
  async createSession(admin, ipAddress, userAgent) {
    const token = generateToken({ id: admin._id, role: admin.role?.name });
    const refreshToken = generateRefreshToken({ id: admin._id });
    
    const session = await AdminSession.create({
      admin: admin._id,
      token,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    
    return { session, token, refreshToken };
  }
  
  async invalidateSession(token) {
    await AdminSession.findOneAndUpdate({ token }, { isActive: false });
  }
  
  async invalidateAllSessions(adminId, exceptToken = null) {
    const query = { admin: adminId, isActive: true };
    if (exceptToken) {
      query.token = { $ne: exceptToken };
    }
    await AdminSession.updateMany(query, { isActive: false });
  }
  
  async generatePasswordResetToken(admin) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    admin.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await admin.save({ validateBeforeSave: false });
    
    return resetToken;
  }
  
  async resetPassword(token, newPassword) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const admin = await Admin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    
    if (!admin) {
      throw new AppError('Token is invalid or has expired', 400);
    }
    
    admin.password = newPassword;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();
    
    await this.invalidateAllSessions(admin._id);
    
    return admin;
  }
}

module.exports = new AuthService();
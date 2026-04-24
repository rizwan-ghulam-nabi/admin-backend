
const { verifyToken } = require('../config/jwt');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from cookie or header
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in.',
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    // ✅ CRITICAL: Populate the role with permissions
    const admin = await Admin.findById(decoded.id)
      .select('-password')
      .populate({
        path: 'role',
        select: 'name permissions',
      });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found.',
      });
    }

    if (admin.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive.',
      });
    }

    // Attach admin to request
    req.admin = admin;
    req.token = token;
    
    // ✅ Debug: Log what permissions are available
    console.log('🔐 Admin:', admin.email);
    console.log('📋 Role:', admin.role?.name);
    console.log('📋 Role permissions:', admin.role?.permissions || 'none');
    console.log('📋 Direct permissions:', admin.permissions || 'none');
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

module.exports = { protect };
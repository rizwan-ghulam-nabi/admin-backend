
// // src/middleware/auth.js
// const jwt = require('jsonwebtoken');
// const Admin = require('../models/Admin');
// const AdminSession = require('../models/AdminSession');
// const AdminRole = require('../models/AdminRole');

// const authenticate = async (req, res, next) => {
//   try {
//     let token;

//     // Get token from header or session
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     } else if (req.session?.token) {
//       token = req.session.token;
//     } else if (req.cookies?.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access denied. No token provided.',
//       });
//     }

//     try {
//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Check if session exists
//       const session = await AdminSession.findOne({
//         admin: decoded.id,
//         token,
//         isValid: true,
//       });

//       if (!session) {
//         return res.status(401).json({
//           success: false,
//           message: 'Session expired. Please login again.',
//         });
//       }

//       // Get admin user
//       const admin = await Admin.findById(decoded.id)
//         .select('-password')
//         .populate('role');

//       if (!admin) {
//         return res.status(401).json({
//           success: false,
//           message: 'Admin not found.',
//         });
//       }

//       if (admin.status !== 'active') {
//         return res.status(403).json({
//           success: false,
//           message: 'Account is deactivated. Contact super admin.',
//         });
//       }

//       // Attach admin to request
//       req.admin = admin;
//       next();
//     } catch (error) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token.',
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// const authorize = (...permissions) => {
//   return async (req, res, next) => {
//     try {
//       if (!req.admin) {
//         return res.status(401).json({
//           success: false,
//           message: 'Not authenticated.',
//         });
//       }

//       // Super admin has all permissions
//       if (req.admin.role?.name === 'super_admin') {
//         return next();
//       }

//       // Check if admin has required permissions
//       const adminRole = await AdminRole.findById(req.admin.role).populate('permissions');
      
//       if (!adminRole) {
//         return res.status(403).json({
//           success: false,
//           message: 'Role not found.',
//         });
//       }

//       const hasPermission = permissions.some(permission =>
//         adminRole.permissions.some(p => p.name === permission)
//       );

//       if (!hasPermission) {
//         return res.status(403).json({
//           success: false,
//           message: 'Insufficient permissions.',
//         });
//       }

//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };

// module.exports = { authenticate, authorize };





















// src/middleware/validate.js
const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // Return validation errors
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  };
};

const validateParams = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // Return validation errors
    return res.status(400).json({
      success: false,
      message: 'Invalid parameters',
      errors: errors.array().map(err => ({
        param: err.path,
        message: err.msg,
      })),
    });
  };
};

module.exports = { validate, validateParams };
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const admin = req.admin;
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      // Super admin has all permissions
      if (admin.role && admin.role.name === 'Super Admin') {
        return next();
      }
      
      // Check if admin has the required permission
      const hasPermission = admin.role?.permissions?.includes(requiredPermission) ||
                           admin.permissions?.includes(requiredPermission);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
          requiredPermission,
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
      });
    }
  };
};

const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const admin = req.admin;
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      // Super admin has all permissions
      if (admin.role && admin.role.name === 'Super Admin') {
        return next();
      }
      
      // Check if admin has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission =>
        admin.role?.permissions?.includes(permission) ||
        admin.permissions?.includes(permission)
      );
      
      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'You do not have all required permissions',
          requiredPermissions,
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
      });
    }
  };
};

module.exports = { checkPermission, checkPermissions };
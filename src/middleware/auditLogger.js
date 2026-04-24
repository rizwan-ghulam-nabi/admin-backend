const AdminLog = require('../models/AdminLog');

const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    let responseBody;
    
    res.json = function(body) {
      responseBody = body;
      return originalJson.call(this, body);
    };
    
    res.on('finish', async () => {
      try {
        if (req.admin && req.method !== 'GET') {
          const logData = {
            admin: req.admin._id,
            action,
            resource,
            resourceId: req.params.id || req.body.id,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.body,
              query: req.query,
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            status: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failed',
          };
          
          if (res.statusCode >= 400) {
            logData.errorMessage = responseBody?.message || 'Unknown error';
          }
          
          // For update operations, store old data if needed
          if (action === 'update' && resource === 'product') {
            // Fetch old data logic here
          }
          
          await AdminLog.create(logData);
        }
      } catch (error) {
        console.error('Audit log error:', error);
      }
    });
    
    next();
  };
};

module.exports = { auditLogger };
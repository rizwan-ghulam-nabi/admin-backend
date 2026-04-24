const AdminLog = require('../models/AdminLog');

class AuditService {
  async log({ admin, action, resource, resourceId, details, ipAddress, userAgent, status = 'success', errorMessage = null, oldData = null, newData = null }) {
    try {
      const logEntry = await AdminLog.create({
        admin,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
        status,
        errorMessage,
        oldData,
        newData,
      });
      
      return logEntry;
    } catch (error) {
      console.error('Failed to write audit log:', error);
      return null;
    }
  }
  
  async getAdminActivity(adminId, options = {}) {
    const { startDate, endDate, actions, limit = 100 } = options;
    
    const query = { admin: adminId };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (actions && actions.length) {
      query.action = { $in: actions };
    }
    
    return AdminLog.find(query)
      .sort('-createdAt')
      .limit(limit);
  }
  
  async getResourceHistory(resource, resourceId, limit = 50) {
    return AdminLog.find({ resource, resourceId })
      .sort('-createdAt')
      .limit(limit)
      .populate('admin', 'name email');
  }
  
  async getSummary(startDate, endDate) {
    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }
    
    const summary = await AdminLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            action: '$action',
            resource: '$resource',
          },
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
        },
      },
      {
        $group: {
          _id: '$_id.resource',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count',
              successCount: '$successCount',
              failureCount: '$failureCount',
            },
          },
          total: { $sum: '$count' },
        },
      },
    ]);
    
    return summary;
  }
}

module.exports = new AuditService();
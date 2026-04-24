const AdminLog = require('../models/AdminLog');
const { AppError } = require('../utils/AppError');

const logController = {
  // Get audit logs
  async getAuditLogs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 50,
        admin,
        action,
        resource,
        status,
        startDate,
        endDate,
        sort = '-createdAt',
      } = req.query;
      
      const query = {};
      
      if (admin) query.admin = admin;
      if (action) query.action = action;
      if (resource) query.resource = resource;
      if (status) query.status = status;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      const logs = await AdminLog.find(query)
        .populate('admin', 'name email')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const total = await AdminLog.countDocuments(query);
      
      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get log by ID
  async getLogById(req, res, next) {
    try {
      const { id } = req.params;
      
      const log = await AdminLog.findById(id).populate('admin', 'name email');
      
      if (!log) {
        throw new AppError('Log not found', 404);
      }
      
      res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get log statistics
  async getLogStats(req, res, next) {
    try {
      const { days = 7 } = req.query;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const stats = await AdminLog.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              action: '$action',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.date',
            actions: {
              $push: {
                action: '$_id.action',
                count: '$count',
              },
            },
            total: { $sum: '$count' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get user activity log
  async getUserActivity(req, res, next) {
    try {
      const { adminId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      const logs = await AdminLog.find({ admin: adminId })
        .sort('-createdAt')
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const total = await AdminLog.countDocuments({ admin: adminId });
      
      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Clean old logs
  async cleanOldLogs(req, res, next) {
    try {
      const { days = 90 } = req.body;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const result = await AdminLog.deleteMany({
        createdAt: { $lt: cutoffDate },
      });
      
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} logs deleted`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = logController;
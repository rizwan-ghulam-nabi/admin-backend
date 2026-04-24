const AdminSetting = require('../models/AdminSetting');
const { auditService } = require('../services/auditService');
const { cacheService } = require('../services/cacheService');
const { AppError } = require('../utils/AppError');

const settingController = {
  // Get all settings
  async getAllSettings(req, res, next) {
    try {
      const cacheKey = 'settings:all';
      let settings = await cacheService.get(cacheKey);
      
      if (!settings) {
        const settingsDocs = await AdminSetting.find();
        settings = settingsDocs.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        
        await cacheService.set(cacheKey, settings, 3600);
      }
      
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get settings by group
  async getSettingsByGroup(req, res, next) {
    try {
      const { group } = req.params;
      
      const cacheKey = `settings:group:${group}`;
      let settings = await cacheService.get(cacheKey);
      
      if (!settings) {
        const settingsDocs = await AdminSetting.find({ group });
        settings = settingsDocs.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        
        await cacheService.set(cacheKey, settings, 3600);
      }
      
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Update settings
  async updateSettings(req, res, next) {
    try {
      const { settings } = req.body;
      
      const operations = [];
      
      for (const [key, value] of Object.entries(settings)) {
        operations.push(
          AdminSetting.findOneAndUpdate(
            { key },
            { 
              value,
              updatedBy: req.admin._id,
              type: typeof value,
            },
            { upsert: true, new: true }
          )
        );
      }
      
      await Promise.all(operations);
      
      // Clear cache
      await cacheService.delPattern('settings:*');
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'settings',
        details: { updatedKeys: Object.keys(settings) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get single setting
  async getSetting(req, res, next) {
    try {
      const { key } = req.params;
      
      const setting = await AdminSetting.findOne({ key });
      
      if (!setting) {
        throw new AppError('Setting not found', 404);
      }
      
      res.status(200).json({
        success: true,
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Create or update setting
  async setSetting(req, res, next) {
    try {
      const { key } = req.params;
      const { value, group, description } = req.body;
      
      const setting = await AdminSetting.findOneAndUpdate(
        { key },
        { 
          value,
          group: group || 'general',
          description,
          updatedBy: req.admin._id,
          type: typeof value,
        },
        { upsert: true, new: true }
      );
      
      // Clear cache
      await cacheService.delPattern('settings:*');
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'settings',
        details: { key, value },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        data: setting,
        message: 'Setting saved successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Delete setting
  async deleteSetting(req, res, next) {
    try {
      const { key } = req.params;
      
      await AdminSetting.findOneAndDelete({ key });
      
      // Clear cache
      await cacheService.delPattern('settings:*');
      
      await auditService.log({
        admin: req.admin._id,
        action: 'delete',
        resource: 'settings',
        details: { key },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        message: 'Setting deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get system info
  async getSystemInfo(req, res, next) {
    try {
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuCount: require('os').cpus().length,
        env: process.env.NODE_ENV,
        timezone: process.env.TZ || 'UTC',
      };
      
      res.status(200).json({
        success: true,
        data: systemInfo,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = settingController;
const { backupService } = require('../services/backupService');
const { auditService } = require('../services/auditService');
const { AppError } = require('../utils/AppError');
const fs = require('fs').promises;
const path = require('path');

const backupController = {
  // Create backup
  async createBackup(req, res, next) {
    try {
      const { type = 'full' } = req.body;
      
      const backup = await backupService.createBackup(type);
      
      await auditService.log({
        admin: req.admin._id,
        action: 'create',
        resource: 'backup',
        details: { type, filename: backup.filename },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(201).json({
        success: true,
        data: backup,
        message: 'Backup created successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // List backups
  async listBackups(req, res, next) {
    try {
      const backups = await backupService.listBackups();
      
      res.status(200).json({
        success: true,
        data: backups,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Download backup
  async downloadBackup(req, res, next) {
    try {
      const { filename } = req.params;
      const backupPath = path.join(process.env.BACKUP_PATH || './backups', filename);
      
      await fs.access(backupPath);
      
      res.download(backupPath, filename);
      
      await auditService.log({
        admin: req.admin._id,
        action: 'read',
        resource: 'backup',
        details: { filename, action: 'download' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    } catch (error) {
      next(new AppError('Backup file not found', 404));
    }
  },
  
  // Restore backup
  async restoreBackup(req, res, next) {
    try {
      const { filename } = req.params;
      
      // Verify admin has restore permission
      if (!req.admin.permissions?.includes('backups.restore')) {
        throw new AppError('You do not have permission to restore backups', 403);
      }
      
      await backupService.restoreBackup(filename);
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'backup',
        details: { filename, action: 'restore' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        message: 'Backup restored successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Delete backup
  async deleteBackup(req, res, next) {
    try {
      const { filename } = req.params;
      
      await backupService.deleteBackup(filename);
      
      await auditService.log({
        admin: req.admin._id,
        action: 'delete',
        resource: 'backup',
        details: { filename },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        message: 'Backup deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = backupController;
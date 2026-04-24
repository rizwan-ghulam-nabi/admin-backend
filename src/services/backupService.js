const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const moment = require('moment');
const logger = require('../config/logger');
const { AppError } = require('../utils/AppError');

class BackupService {
  constructor() {
    this.backupPath = process.env.BACKUP_PATH || './backups';
    this.ensureBackupDirectory();
  }
  
  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupPath);
    } catch {
      await fs.mkdir(this.backupPath, { recursive: true });
    }
  }
  
  async createBackup(type = 'full') {
    const timestamp = moment().format('YYYY-MM-DD-HH-mm-ss');
    const filename = `backup-${type}-${timestamp}.dump`;
    const filepath = path.join(this.backupPath, filename);
    
    try {
      // Create MongoDB dump
      const dbUri = process.env.MONGODB_URI;
      const dbName = dbUri.split('/').pop().split('?')[0];
      
      await this.executeCommand(`mongodump --uri="${dbUri}" --out="${filepath}"`);
      
      // Compress the backup
      const compressedPath = `${filepath}.zip`;
      await this.compressDirectory(filepath, compressedPath);
      
      // Remove uncompressed backup
      await fs.rm(filepath, { recursive: true, force: true });
      
      // Get file size
      const stats = await fs.stat(compressedPath);
      
      // Clean old backups
      await this.cleanOldBackups();
      
      return {
        filename: path.basename(compressedPath),
        path: compressedPath,
        size: stats.size,
        type,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('Backup creation failed:', error);
      throw new AppError('Failed to create backup', 500);
    }
  }
  
  async compressDirectory(source, destination) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(destination);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', resolve);
      archive.on('error', reject);
      
      archive.pipe(output);
      archive.directory(source, false);
      archive.finalize();
    });
  }
  
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupPath);
      const backups = [];
      
      for (const file of files) {
        if (file.endsWith('.zip')) {
          const stats = await fs.stat(path.join(this.backupPath, file));
          backups.push({
            filename: file,
            size: stats.size,
            createdAt: stats.birthtime,
          });
        }
      }
      
      return backups.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      logger.error('List backups failed:', error);
      return [];
    }
  }
  
  async restoreBackup(filename) {
    const filepath = path.join(this.backupPath, filename);
    
    try {
      await fs.access(filepath);
      
      // Extract backup
      const extractPath = path.join(this.backupPath, 'temp-restore');
      await this.extractZip(filepath, extractPath);
      
      // Restore MongoDB
      const dbUri = process.env.MONGODB_URI;
      await this.executeCommand(`mongorestore --uri="${dbUri}" "${extractPath}"`);
      
      // Clean up
      await fs.rm(extractPath, { recursive: true, force: true });
      
      logger.info('Backup restored successfully:', { filename });
      return true;
    } catch (error) {
      logger.error('Backup restore failed:', error);
      throw new AppError('Failed to restore backup', 500);
    }
  }
  
  async deleteBackup(filename) {
    const filepath = path.join(this.backupPath, filename);
    
    try {
      await fs.access(filepath);
      await fs.unlink(filepath);
      return true;
    } catch (error) {
      throw new AppError('Backup file not found', 404);
    }
  }
  
  async cleanOldBackups() {
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
    const cutoffDate = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    const backups = await this.listBackups();
    
    for (const backup of backups) {
      if (backup.createdAt.getTime() < cutoffDate) {
        await this.deleteBackup(backup.filename);
        logger.info('Deleted old backup:', { filename: backup.filename });
      }
    }
  }
  
  executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }
  
  extractZip(zipPath, destination) {
    return new Promise((resolve, reject) => {
      const extract = require('extract-zip');
      extract(zipPath, { dir: destination })
        .then(resolve)
        .catch(reject);
    });
  }
  
  async scheduleBackup(cronExpression) {
    const cron = require('node-cron');
    
    cron.schedule(cronExpression, async () => {
      logger.info('Running scheduled backup');
      await this.createBackup('auto');
    });
  }
}

module.exports = new BackupService();
const { auditService } = require('../services/auditService');
const { emailService } = require('../services/emailService');
const axios = require('axios');
const { AppError } = require('../utils/AppError');

const userController = {
  // Get all users
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search, role, status, sort = '-createdAt' } = req.query;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/users`, {
        params: { page, limit, search, role, status, sort },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      res.status(200).json({
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get single user
  async getUser(req, res, next) {
    try {
      const { id } = req.params;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/users/${id}`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      if (!response.data.data) {
        throw new AppError('User not found', 404);
      }
      
      res.status(200).json({
        success: true,
        data: response.data.data,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Create user
  async createUser(req, res, next) {
    try {
      const userData = req.body;
      
      const response = await axios.post(`${process.env.CUSTOMER_API_URL}/users`, userData, {
        headers: { 
          'x-api-key': process.env.CUSTOMER_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      await auditService.log({
        admin: req.admin._id,
        action: 'create',
        resource: 'user',
        resourceId: response.data.data._id,
        details: { email: userData.email, name: userData.name },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      // Send welcome email
      if (userData.email) {
        await emailService.sendWelcomeEmail(userData.email, userData.name);
      }
      
      res.status(201).json({
        success: true,
        data: response.data.data,
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Update user
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const response = await axios.put(`${process.env.CUSTOMER_API_URL}/users/${id}`, updateData, {
        headers: { 
          'x-api-key': process.env.CUSTOMER_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'user',
        resourceId: id,
        details: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        data: response.data.data,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Delete user
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      await axios.delete(`${process.env.CUSTOMER_API_URL}/users/${id}`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      await auditService.log({
        admin: req.admin._id,
        action: 'delete',
        resource: 'user',
        resourceId: id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Update user status
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      
      const response = await axios.patch(`${process.env.CUSTOMER_API_URL}/users/${id}/status`,
        { status, reason },
        { headers: { 'x-api-key': process.env.CUSTOMER_API_KEY } }
      );
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'user',
        resourceId: id,
        details: { status, reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      // Send notification email
      if (response.data.data.email) {
        await emailService.sendAccountStatusEmail(response.data.data.email, status, reason);
      }
      
      res.status(200).json({
        success: true,
        data: response.data.data,
        message: `User status updated to ${status}`,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get user orders
  async getUserOrders(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/users/${id}/orders`, {
        params: { page, limit },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      res.status(200).json({
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get user statistics
  async getUserStats(req, res, next) {
    try {
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/users/stats`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      res.status(200).json({
        success: true,
        data: response.data.data,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Export users
  async exportUsers(req, res, next) {
    try {
      const { format = 'csv', ...filters } = req.query;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/users/export`, {
        params: { format, ...filters },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY },
        responseType: 'stream'
      });
      
      const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=users.${format}`);
      
      response.data.pipe(res);
      
      await auditService.log({
        admin: req.admin._id,
        action: 'export',
        resource: 'user',
        details: { format, filters },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
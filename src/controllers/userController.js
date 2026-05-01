
// // // admin-panel/controllers/userController.js
// // const { auditService } = require('../services/auditService');
// // const { emailService } = require('../services/emailService');
// // const axios = require('axios');
// // const { AppError } = require('../utils/AppError');

// // const userController = {
// //   // Get all users
// //   async getAllUsers(req, res, next) {
// //     try {
// //       const { page = 1, limit = 20, search, role, status, sort = '-createdAt' } = req.query;
      
// //       // ✅ CHANGED: /users → /api/v1/userManagement
// //       const response = await axios.get(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement`, {
// //         params: { page, limit, search, role, status, sort },
// //         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
// //       });
      
// //       res.status(200).json({
// //         success: true,
// //         data: response.data.data,
// //         pagination: response.data.pagination,
// //       });
// //     } catch (error) {
// //       next(error);
// //     }
// //   },
  
// //   // Get single user
// //   async getUser(req, res, next) {
// //     try {
// //       const { id } = req.params;
      
// //       // ✅ CHANGED: /users/:id → /api/v1/userManagement/:id
// //       const response = await axios.get(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/${id}`, {
// //         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
// //       });
      
// //       if (!response.data.data) {
// //         throw new AppError('User not found', 404);
// //       }
      
// //       res.status(200).json({
// //         success: true,
// //         data: response.data.data,
// //       });
// //     } catch (error) {
// //       next(error);
// //     }
// //   },
  
// //   // Create user
// //   async createUser(req, res, next) {
// //     try {
// //       const userData = req.body;
      
// //       // ✅ CHANGED: /users → /api/v1/userManagement
// //       const response = await axios.post(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement`, userData, {
// //         headers: { 
// //           'x-api-key': process.env.CUSTOMER_API_KEY,
// //           'Content-Type': 'application/json'
// //         }
// //       });
      
// //       await auditService.log({
// //         admin: req.admin._id,
// //         action: 'create',
// //         resource: 'user',
// //         resourceId: response.data.data._id,
// //         details: { email: userData.email, name: userData.name },
// //         ipAddress: req.ip,
// //         userAgent: req.get('user-agent'),
// //       });
      
// //       // Send welcome email
// //       if (userData.email) {
// //         await emailService.sendWelcomeEmail(userData.email, userData.name);
// //       }
      
// //       res.status(201).json({
// //         success: true,
// //         data: response.data.data,
// //         message: 'User created successfully',
// //       });
// //     } catch (error) {
// //       next(error);
// //     }
// //   },
  
// //   // Update user
// //   async updateUser(req, res, next) {
// //     try {
// //       const { id } = req.params;
// //       const updateData = req.body;
      
// //       // ✅ CHANGED: /users/:id → /api/v1/userManagement/:id
// //       const response = await axios.put(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/${id}`, updateData, {
// //         headers: { 
// //           'x-api-key': process.env.CUSTOMER_API_KEY,
// //           'Content-Type': 'application/json'
// //         }
// //       });
      
// //       await auditService.log({
// //         admin: req.admin._id,
// //         action: 'update',
// //         resource: 'user',
// //         resourceId: id,
// //         details: updateData,
// //         ipAddress: req.ip,
// //         userAgent: req.get('user-agent'),
// //       });
      
// //       res.status(200).json({
// //         success: true,
// //         data: response.data.data,
// //         message: 'User updated successfully',
// //       });
// //     } catch (error) {
// //       next(error);
// //     }
// //   },
  
// //   // Delete user
// //   async deleteUser(req, res, next) {
// //     try {
// //       const { id } = req.params;
      
// //       // ✅ CHANGED: /users/:id → /api/v1/userManagement/:id
// //       await axios.delete(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/${id}`, {
// //         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
// //       });
      
// //       await auditService.log({
// //         admin: req.admin._id,
// //         action: 'delete',
// //         resource: 'user',
// //         resourceId: id,
// //         ipAddress: req.ip,
// //         userAgent: req.get('user-agent'),
// //       });
      
// //       res.status(200).json({
// //         success: true,
// //         message: 'User deleted successfully',
// //       });
// //     } catch (error) {
// //       next(error);
// //     }
// //   },
  
// //   // Update user status
// //   async updateUserStatus(req, res, next) {
// //     try {
// //       const { id } = req.params;
// //       const { status, reason } = req.body;
      
// //       // ✅ CHANGED: /users/:id/status → /api/v1/userManagement/:id/status
// //       const response = await axios.patch(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/${id}/status`,
// //         { status, reason },
// //         { headers: { 'x-api-key': process.env.CUSTOMER_API_KEY } }
// //       );
      
// //       await auditService.log({
// //         admin: req.admin._id,
// //         action: 'update',
// //         resource: 'user',
// //         resourceId: id,
// //         details: { status, reason },
// //         ipAddress: req.ip,
// //         userAgent: req.get('user-agent'),
// //       });
      
// //       // Send notification email
// //       if (response.data.data && response.data.data.email) {
// //         await emailService.sendAccountStatusEmail(response.data.data.email, status, reason);
// //       }
      
// //       res.status(200).json({
// //         success: true,
// //         data: response.data.data,
// //         message: `User status updated to ${status}`,
// //       });
// //     } catch (error) {
// //       next(error);
// //     }
// //   },
  
// //   // Get user orders
// //   async getUserOrders(req, res, next) {
// //     try {
// //       const { id } = req.params;
// //       const { page = 1, limit = 20 } = req.query;
      
// //       // Orders might be at a different endpoint, keep or adjust as needed
// //       const response = await axios.get(`${process.env.CUSTOMER_API_URL}/api/v1/orders/user/${id}`, {
// //         params: { page, limit },
// //         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
// //       });
      
// //       res.status(200).json({
// //         success: true,
// //         data: response.data.data,
// //         pagination: response.data.pagination,
// //       });
// //     } catch (error) {
// //       next(error);
// //     }
// //   },
  
// //   // Get user statistics
// //   async getUserStats(req, res, next) {
// //     try {
// //       // ✅ CHANGED: /users/stats → /api/v1/userManagement/stats
// //       const response = await axios.get(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/stats`, {
// //         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
// //       });
      
// //       res.status(200).json({
// //         success: true,
// //         data: response.data.data,
// //       });
// //     } catch (error) {
// //       next(error);
// //     }
// //   },
  
// //   // Export users
// //   async exportUsers(req, res, next) {
// //     try {
// //       const { format = 'csv', ...filters } = req.query;
      
// //       // ✅ CHANGED: /users/export → /api/v1/userManagement/export
// //       const response = await axios.get(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/export`, {
// //         params: { format, ...filters },
// //         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY },
// //         responseType: 'stream'
// //       });
      
// //       const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
// //       res.setHeader('Content-Type', contentType);
// //       res.setHeader('Content-Disposition', `attachment; filename=users.${format}`);
      
// //       response.data.pipe(res);
      
// //       await auditService.log({
// //         admin: req.admin._id,
// //         action: 'export',
// //         resource: 'user',
// //         details: { format, filters },
// //         ipAddress: req.ip,
// //         userAgent: req.get('user-agent'),
// //       });
// //     } catch (error) {
// //       next(error);
// //     }
// //   },
// // };

// // module.exports = userController;



















// // admin-panel/controllers/userController.js
// const { auditService } = require('../services/auditService');
// const { emailService } = require('../services/emailService');
// const axios = require('axios');
// const { AppError } = require('../utils/AppError');

// const userController = {
//   // Get all users
//   async getAllUsers(req, res, next) {
//     try {
//       const { page = 1, limit = 20, search, role, status, sort = '-createdAt' } = req.query;
      
//       // ✅ DEBUG LOGS
//       console.log('=== getAllUsers CALLED ===');
//       console.log('CUSTOMER_API_URL:', process.env.CUSTOMER_API_URL);
//       console.log('CUSTOMER_API_KEY exists:', !!process.env.CUSTOMER_API_KEY);
//       console.log('Full URL:', `${process.env.CUSTOMER_API_URL}/api/v1/userManagement`);
      
//       const response = await axios.get(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement`, {
//         params: { page, limit, search, role, status, sort },
//         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
//       });
      
//       console.log('✅ E-commerce response status:', response.status);
      
//       res.status(200).json({
//         success: true,
//         data: response.data.data,
//         pagination: response.data.pagination,
//       });
//     } catch (error) {
//       // ✅ DETAILED ERROR LOGS
//       console.error('=== ERROR CALLING E-COMMERCE ===');
//       console.error('Error message:', error.message);
      
//       if (error.response) {
//         console.error('Response status:', error.response.status);
//         console.error('Response data:', JSON.stringify(error.response.data));
//       } else if (error.request) {
//         console.error('No response received - Is e-commerce store running?');
//         console.error('Request URL:', error.config?.url);
//       }
      
//       // Send better error to frontend
//       return res.status(500).json({
//         success: false,
//         message: error.response?.data?.message || error.message || 'Server Error',
//         debug: process.env.NODE_ENV === 'development' ? {
//           status: error.response?.status,
//           data: error.response?.data
//         } : undefined
//       });
//     }
//   },
  
//   // Get user statistics
//   async getUserStats(req, res, next) {
//     try {
//       console.log('=== getUserStats CALLED ===');
      
//       const response = await axios.get(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/stats`, {
//         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
//       });
      
//       console.log('✅ Stats response status:', response.status);
      
//       res.status(200).json({
//         success: true,
//         data: response.data.data,
//       });
//     } catch (error) {
//       console.error('=== ERROR GETTING STATS ===');
//       console.error('Error message:', error.message);
//       console.error('Response:', error.response?.data);
      
//       return res.status(500).json({
//         success: false,
//         message: error.response?.data?.message || error.message || 'Server Error'
//       });
//     }
//   },

//   // Get single user
//   async getUser(req, res, next) {
//     try {
//       const { id } = req.params;
      
//       const response = await axios.get(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/${id}`, {
//         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
//       });
      
//       if (!response.data.data) {
//         throw new AppError('User not found', 404);
//       }
      
//       res.status(200).json({
//         success: true,
//         data: response.data.data,
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
  
//   // Create user
//   async createUser(req, res, next) {
//     try {
//       const userData = req.body;
      
//       const response = await axios.post(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement`, userData, {
//         headers: { 
//           'x-api-key': process.env.CUSTOMER_API_KEY,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       await auditService.log({
//         admin: req.admin._id,
//         action: 'create',
//         resource: 'user',
//         resourceId: response.data.data._id,
//         details: { email: userData.email, name: userData.name },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       if (userData.email) {
//         await emailService.sendWelcomeEmail(userData.email, userData.name);
//       }
      
//       res.status(201).json({
//         success: true,
//         data: response.data.data,
//         message: 'User created successfully',
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
  
//   // Update user
//   async updateUser(req, res, next) {
//     try {
//       const { id } = req.params;
//       const updateData = req.body;
      
//       const response = await axios.put(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/${id}`, updateData, {
//         headers: { 
//           'x-api-key': process.env.CUSTOMER_API_KEY,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       await auditService.log({
//         admin: req.admin._id,
//         action: 'update',
//         resource: 'user',
//         resourceId: id,
//         details: updateData,
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       res.status(200).json({
//         success: true,
//         data: response.data.data,
//         message: 'User updated successfully',
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
  
//   // Delete user
//   async deleteUser(req, res, next) {
//     try {
//       const { id } = req.params;
      
//       await axios.delete(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/${id}`, {
//         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
//       });
      
//       await auditService.log({
//         admin: req.admin._id,
//         action: 'delete',
//         resource: 'user',
//         resourceId: id,
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       res.status(200).json({
//         success: true,
//         message: 'User deleted successfully',
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
  
//   // Update user status
//   async updateUserStatus(req, res, next) {
//     try {
//       const { id } = req.params;
//       const { status, reason } = req.body;
      
//       const response = await axios.patch(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/${id}/status`,
//         { status, reason },
//         { headers: { 'x-api-key': process.env.CUSTOMER_API_KEY } }
//       );
      
//       await auditService.log({
//         admin: req.admin._id,
//         action: 'update',
//         resource: 'user',
//         resourceId: id,
//         details: { status, reason },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
      
//       if (response.data.data && response.data.data.email) {
//         await emailService.sendAccountStatusEmail(response.data.data.email, status, reason);
//       }
      
//       res.status(200).json({
//         success: true,
//         data: response.data.data,
//         message: `User status updated to ${status}`,
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
  
//   // Get user orders
//   async getUserOrders(req, res, next) {
//     try {
//       const { id } = req.params;
//       const { page = 1, limit = 20 } = req.query;
      
//       const response = await axios.get(`${process.env.CUSTOMER_API_URL}/api/v1/orders/user/${id}`, {
//         params: { page, limit },
//         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
//       });
      
//       res.status(200).json({
//         success: true,
//         data: response.data.data,
//         pagination: response.data.pagination,
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
  
//   // Export users
//   async exportUsers(req, res, next) {
//     try {
//       const { format = 'csv', ...filters } = req.query;
      
//       const response = await axios.get(`${process.env.CUSTOMER_API_URL}/api/v1/userManagement/export`, {
//         params: { format, ...filters },
//         headers: { 'x-api-key': process.env.CUSTOMER_API_KEY },
//         responseType: 'stream'
//       });
      
//       const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
//       res.setHeader('Content-Type', contentType);
//       res.setHeader('Content-Disposition', `attachment; filename=users.${format}`);
      
//       response.data.pipe(res);
      
//       await auditService.log({
//         admin: req.admin._id,
//         action: 'export',
//         resource: 'user',
//         details: { format, filters },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
// };

// module.exports = userController;







//30/04/2026

// admin-panel/controllers/userController.js
const { auditService } = require('../services/auditService');
const { emailService } = require('../services/emailService');
const axios = require('axios');
const { AppError } = require('../utils/AppError');

const userController = {
  // Get all users
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search, role, status, sort = '-createdAt' } = req.query;
      
      // ✅ DEBUG LOGS
      console.log('=== getAllUsers CALLED ===');
      console.log('CUSTOMER_API_URL:', process.env.CUSTOMER_API_URL);
      console.log('CUSTOMER_API_KEY exists:', !!process.env.CUSTOMER_API_KEY);
      // ✅ FIXED: Removed duplicate /api/v1
      console.log('Full URL:', `${process.env.CUSTOMER_API_URL}/userManagement`);
      
      // ✅ FIXED: Removed /api/v1 from URL
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/userManagement`, {
        params: { page, limit, search, role, status, sort },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      console.log('✅ E-commerce response status:', response.status);
      
      res.status(200).json({
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      });
    } catch (error) {
      // ✅ DETAILED ERROR LOGS
      console.error('=== ERROR CALLING E-COMMERCE ===');
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('No response received - Is e-commerce store running?');
        console.error('Request URL:', error.config?.url);
      }
      
      // Send better error to frontend
      return res.status(500).json({
        success: false,
        message: error.response?.data?.message || error.message || 'Server Error',
        debug: process.env.NODE_ENV === 'development' ? {
          status: error.response?.status,
          data: error.response?.data
        } : undefined
      });
    }
  },
  
  // Get user statistics
  async getUserStats(req, res, next) {
    try {
      console.log('=== getUserStats CALLED ===');
      
      // ✅ FIXED: Removed /api/v1 from URL
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/userManagement/stats`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      console.log('✅ Stats response status:', response.status);
      
      res.status(200).json({
        success: true,
        data: response.data.data,
      });
    } catch (error) {
      console.error('=== ERROR GETTING STATS ===');
      console.error('Error message:', error.message);
      console.error('Response:', error.response?.data);
      
      return res.status(500).json({
        success: false,
        message: error.response?.data?.message || error.message || 'Server Error'
      });
    }
  },

  // Get single user
  async getUser(req, res, next) {
    try {
      const { id } = req.params;
      
      // ✅ FIXED: Removed /api/v1 from URL
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/userManagement/${id}`, {
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
      
      // ✅ FIXED: Removed /api/v1 from URL
      const response = await axios.post(`${process.env.CUSTOMER_API_URL}/userManagement`, userData, {
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
      
      // ✅ FIXED: Removed /api/v1 from URL
      const response = await axios.put(`${process.env.CUSTOMER_API_URL}/userManagement/${id}`, updateData, {
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
      
      // ✅ FIXED: Removed /api/v1 from URL
      await axios.delete(`${process.env.CUSTOMER_API_URL}/userManagement/${id}`, {
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
      
      // ✅ FIXED: Removed /api/v1 from URL
      const response = await axios.patch(`${process.env.CUSTOMER_API_URL}/userManagement/${id}/status`,
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
      
      if (response.data.data && response.data.data.email) {
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
      
      // ✅ FIXED: Removed /api/v1 from URL
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/orders/user/${id}`, {
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
  
  // Export users
  async exportUsers(req, res, next) {
    try {
      const { format = 'csv', ...filters } = req.query;
      
      // ✅ FIXED: Removed /api/v1 from URL
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/userManagement/export`, {
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
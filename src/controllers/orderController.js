
/// 30/04/2026


const { auditService } = require('../services/auditService');
const { cacheService } = require('../services/cacheService');
const { emailService } = require('../services/emailService');
const axios = require('axios');
const { AppError } = require('../utils/AppError');
const Revenue = require('../models/Revenue'); // ✅ Import Revenue model
const logger = require('../config/logger');

const orderController = {


// In admin-backend/src/controllers/orderController.js
// admin-backend/src/controllers/orderController.js
async getAllOrders(req, res, next) {
  try {
    const { page = 1, limit = 20, status, paymentStatus, startDate, endDate, search, sort = '-createdAt' } = req.query;
    
    // ✅ Use /orders/admin/all (matches main backend route)
    const url = `${process.env.CUSTOMER_API_URL}/orders/admin/all`;
    
    console.log('🔍 Calling:', url);
    
    const response = await axios.get(url, {
      params: { page, limit, status, paymentStatus, startDate, endDate, search, sort },
      headers: { 
        'x-api-key': process.env.CUSTOMER_API_KEY,
      }
    });
    
    console.log('✅ Success');
    
    res.status(200).json({
      success: true,
      data: response.data.data || response.data,
      pagination: response.data.pagination,
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(200).json({ success: true, data: [] });
  }
},



  // Get single order
  async getOrder(req, res, next) {
    try {
      const { id } = req.params;
      
     const response = await axios.get(`${process.env.CUSTOMER_API_URL}/orders/admin/all?id=${id}`,  {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      if (!response.data.data) {
        throw new AppError('Order not found', 404);
      }
      
      res.status(200).json({
        success: true,
        data: response.data.data,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Update order status - ✅ Add revenue tracking when status changes to delivered
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      
      const response = await axios.patch(`${process.env.CUSTOMER_API_URL}/orders/admin/${id}/status`,  
        { status, note },
        { headers: { 'x-api-key': process.env.CUSTOMER_API_KEY } }
      );
      
      const orderData = response.data.data;
      
      // ✅ Create revenue when order is marked as delivered
      if (status === 'delivered' && orderData) {
        try {
          await Revenue.create({
            amount: orderData.total || 0,
            type: 'sale',
            orderId: id,
            customerId: orderData.user || orderData.customer?._id,
            paymentMethod: orderData.paymentMethod || 'other',
            status: 'completed',
            transactionId: orderData.transactionId || id,
            description: `Order #${orderData.orderNumber || id} completed`,
            revenueDate: new Date(),
            category: 'sales',
            tax: orderData.tax || 0,
            shipping: orderData.shippingCost || 0,
            discount: orderData.discount || 0,
          });
          logger.info(`✅ Revenue recorded for order ${id}: $${orderData.total}`);
        } catch (revenueError) {
          logger.error('Failed to record revenue:', revenueError.message);
        }
      }
      
      // ✅ Handle refund when order is cancelled
      if (status === 'cancelled' && orderData) {
        try {
          // Create a negative revenue entry for refund
          await Revenue.create({
            amount: -(orderData.total || 0),
            type: 'refund',
            orderId: id,
            customerId: orderData.user || orderData.customer?._id,
            paymentMethod: orderData.paymentMethod || 'other',
            status: 'completed',
            transactionId: `REFUND-${id}`,
            description: `Refund for Order #${orderData.orderNumber || id}`,
            revenueDate: new Date(),
            category: 'refunds',
          });
          logger.info(`✅ Refund recorded for order ${id}`);
        } catch (revenueError) {
          logger.error('Failed to record refund:', revenueError.message);
        }
      }
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'order',
        resourceId: id,
        details: { status, note },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      // Send email notification if configured
      if (response.data.data.userEmail) {
        await emailService.sendOrderStatusUpdate(response.data.data.userEmail, {
          orderId: id,
          status,
          note,
        });
      }
      
      // Clear cache
      await cacheService.delPattern(`orders:${id}`);
      
      res.status(200).json({
        success: true,
        data: response.data.data,
        message: `Order status updated to ${status}`,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Update payment status - ✅ Add revenue when payment is completed
  async updatePaymentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { paymentStatus, transactionId } = req.body;
      
      const response = await axios.post(`${process.env.CUSTOMER_API_URL}/orders/admin/${id}/cancel`, 
        { paymentStatus, transactionId },
        { headers: { 'x-api-key': process.env.CUSTOMER_API_KEY } }
      );
      
      const orderData = response.data.data;
      
      // ✅ Record revenue when payment is completed
      if (paymentStatus === 'paid' && orderData && orderData.status === 'delivered') {
        try {
          const existingRevenue = await Revenue.findOne({ orderId: id, type: 'sale' });
          if (!existingRevenue) {
            await Revenue.create({
              amount: orderData.total || 0,
              type: 'sale',
              orderId: id,
              customerId: orderData.user || orderData.customer?._id,
              paymentMethod: orderData.paymentMethod || 'other',
              status: 'completed',
              transactionId: transactionId || id,
              description: `Payment received for Order #${orderData.orderNumber || id}`,
              revenueDate: new Date(),
              category: 'sales',
              tax: orderData.tax || 0,
              shipping: orderData.shippingCost || 0,
              discount: orderData.discount || 0,
            });
            logger.info(`✅ Revenue recorded for payment on order ${id}`);
          }
        } catch (revenueError) {
          logger.error('Failed to record revenue:', revenueError.message);
        }
      }
      
      // ✅ Handle refund when payment is refunded
      if (paymentStatus === 'refunded' && orderData) {
        try {
          await Revenue.create({
            amount: -(orderData.total || 0),
            type: 'refund',
            orderId: id,
            customerId: orderData.user || orderData.customer?._id,
            paymentMethod: orderData.paymentMethod || 'other',
            status: 'completed',
            transactionId: `REFUND-${transactionId || id}`,
            description: `Payment refunded for Order #${orderData.orderNumber || id}`,
            revenueDate: new Date(),
            category: 'refunds',
          });
          logger.info(`✅ Refund recorded for order ${id}`);
        } catch (revenueError) {
          logger.error('Failed to record refund:', revenueError.message);
        }
      }
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'order',
        resourceId: id,
        details: { paymentStatus, transactionId },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        data: response.data.data,
        message: `Payment status updated to ${paymentStatus}`,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Cancel order - ✅ Already handles refund in updateOrderStatus
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      // Get order details first to record refund
      const orderResponse = await axios.get(`${process.env.CUSTOMER_API_URL}/orders/${id}`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      const orderData = orderResponse.data.data;
      
      const response = await axios.post(`${process.env.CUSTOMER_API_URL}/orders/${id}/cancel`, 
        { reason },
        { headers: { 'x-api-key': process.env.CUSTOMER_API_KEY } }
      );
      
      // ✅ Record refund for cancelled order
      if (orderData) {
        try {
          await Revenue.create({
            amount: -(orderData.total || 0),
            type: 'refund',
            orderId: id,
            customerId: orderData.user || orderData.customer?._id,
            paymentMethod: orderData.paymentMethod || 'other',
            status: 'completed',
            transactionId: `CANCEL-${id}`,
            description: `Order #${orderData.orderNumber || id} cancelled: ${reason || 'No reason provided'}`,
            revenueDate: new Date(),
            category: 'refunds',
          });
          logger.info(`✅ Refund recorded for cancelled order ${id}`);
        } catch (revenueError) {
          logger.error('Failed to record refund:', revenueError.message);
        }
      }
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'order',
        resourceId: id,
        details: { action: 'cancel', reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        data: response.data.data,
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Generate invoice
  async generateInvoice(req, res, next) {
    try {
      const { id } = req.params;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/orders/${id}/invoice`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY },
        responseType: 'stream'
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
      
      response.data.pipe(res);
    } catch (error) {
      next(error);
    }
  },
  
  // Get order statistics
  async getOrderStats(req, res, next) {
    try {
      const { period = 'month' } = req.query;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/orders/stats`, {
        params: { period },
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
  
  // Bulk update orders - ✅ Add revenue tracking for bulk updates
  async bulkUpdateOrders(req, res, next) {
    try {
      const { orderIds, status, note } = req.body;
      
      const response = await axios.post(`${process.env.CUSTOMER_API_URL}/orders/bulk-update`,
        { orderIds, status, note },
        { headers: { 'x-api-key': process.env.CUSTOMER_API_KEY } }
      );
      
      // ✅ Record revenue for bulk status updates
      if (status === 'delivered') {
        for (const id of orderIds) {
          try {
            const orderResponse = await axios.get(`${process.env.CUSTOMER_API_URL}/orders/${id}`, {
              headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
            });
            const orderData = orderResponse.data.data;
            if (orderData) {
              await Revenue.create({
                amount: orderData.total || 0,
                type: 'sale',
                orderId: id,
                customerId: orderData.user || orderData.customer?._id,
                paymentMethod: orderData.paymentMethod || 'other',
                status: 'completed',
                transactionId: id,
                description: `Bulk update - Order #${orderData.orderNumber || id} completed`,
                revenueDate: new Date(),
                category: 'sales',
              });
            }
          } catch (err) {
            logger.error(`Failed to record revenue for order ${id}:`, err.message);
          }
        }
      }
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'order',
        details: { bulk: true, count: orderIds.length, status, note },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        data: response.data.data,
        message: `${orderIds.length} orders updated successfully`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = orderController;
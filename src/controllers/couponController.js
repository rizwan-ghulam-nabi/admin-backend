const { auditService } = require('../services/auditService');
const { cacheService } = require('../services/cacheService');
const axios = require('axios');
const { AppError } = require('../utils/AppError');

const couponController = {
  // Get all coupons
  async getAllCoupons(req, res, next) {
    try {
      const { page = 1, limit = 20, code, status, type, sort = '-createdAt' } = req.query;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/coupons`, {
        params: { page, limit, code, status, type, sort },
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
  
  // Get single coupon
  async getCoupon(req, res, next) {
    try {
      const { id } = req.params;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/coupons/${id}`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      if (!response.data.data) {
        throw new AppError('Coupon not found', 404);
      }
      
      res.status(200).json({
        success: true,
        data: response.data.data,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Create coupon
  async createCoupon(req, res, next) {
    try {
      const couponData = req.body;
      
      const response = await axios.post(`${process.env.CUSTOMER_API_URL}/coupons`, couponData, {
        headers: { 
          'x-api-key': process.env.CUSTOMER_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      await auditService.log({
        admin: req.admin._id,
        action: 'create',
        resource: 'coupon',
        resourceId: response.data.data._id,
        details: { code: couponData.code, type: couponData.type },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      // Clear cache
      await cacheService.delPattern('coupons:*');
      
      res.status(201).json({
        success: true,
        data: response.data.data,
        message: 'Coupon created successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Update coupon
  async updateCoupon(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const response = await axios.put(`${process.env.CUSTOMER_API_URL}/coupons/${id}`, updateData, {
        headers: { 
          'x-api-key': process.env.CUSTOMER_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'coupon',
        resourceId: id,
        details: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      // Clear cache
      await cacheService.delPattern('coupons:*');
      
      res.status(200).json({
        success: true,
        data: response.data.data,
        message: 'Coupon updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Delete coupon
  async deleteCoupon(req, res, next) {
    try {
      const { id } = req.params;
      
      await axios.delete(`${process.env.CUSTOMER_API_URL}/coupons/${id}`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      await auditService.log({
        admin: req.admin._id,
        action: 'delete',
        resource: 'coupon',
        resourceId: id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      // Clear cache
      await cacheService.delPattern('coupons:*');
      
      res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Validate coupon
  async validateCoupon(req, res, next) {
    try {
      const { code, cartTotal } = req.body;
      
      const response = await axios.post(`${process.env.CUSTOMER_API_URL}/coupons/validate`,
        { code, cartTotal },
        { headers: { 'x-api-key': process.env.CUSTOMER_API_KEY } }
      );
      
      res.status(200).json({
        success: true,
        data: response.data.data,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get coupon statistics
  async getCouponStats(req, res, next) {
    try {
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/coupons/stats`, {
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
  
  // Bulk delete coupons
  async bulkDeleteCoupons(req, res, next) {
    try {
      const { couponIds } = req.body;
      
      await axios.post(`${process.env.CUSTOMER_API_URL}/coupons/bulk-delete`,
        { couponIds },
        { headers: { 'x-api-key': process.env.CUSTOMER_API_KEY } }
      );
      
      await auditService.log({
        admin: req.admin._id,
        action: 'delete',
        resource: 'coupon',
        details: { bulk: true, count: couponIds.length },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      // Clear cache
      await cacheService.delPattern('coupons:*');
      
      res.status(200).json({
        success: true,
        message: `${couponIds.length} coupons deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = couponController;
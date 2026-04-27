// const Revenue = require('../models/Revenue');
// const { AppError } = require('../utils/AppError');
// const logger = require('../config/logger');

// const revenueController = {
//   // Get total revenue stats
//   async getTotalRevenue(req, res, next) {
//     try {
//       const { startDate, endDate } = req.query;
      
//       const totalRevenue = await Revenue.getTotalRevenue(startDate, endDate);
//       const revenueChange = await Revenue.getRevenueChange();
      
//       res.status(200).json({
//         success: true,
//         data: {
//           totalRevenue: totalRevenue.total || 0,
//           totalOrders: totalRevenue.count || 0,
//           revenueChange: revenueChange.change || 0,
//           currentMonth: revenueChange.currentMonth || 0,
//           previousMonth: revenueChange.previousMonth || 0,
//         }
//       });
//     } catch (error) {
//       logger.error('Get total revenue error:', error.message);
//       next(error);
//     }
//   },

//   // Get monthly revenue chart data
//   async getMonthlyRevenue(req, res, next) {
//     try {
//       const { year } = req.query;
//       const monthlyData = await Revenue.getMonthlyRevenue(year);
      
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
//       const chartData = months.map((month, index) => {
//         const found = monthlyData.find(m => m._id.month === index + 1);
//         return {
//           name: month,
//           revenue: found ? found.revenue : 0,
//           orders: found ? found.orders : 0,
//         };
//       });
      
//       res.status(200).json({
//         success: true,
//         data: chartData,
//       });
//     } catch (error) {
//       logger.error('Get monthly revenue error:', error.message);
//       next(error);
//     }
//   },

//   // Get daily revenue chart data
//   async getDailyRevenue(req, res, next) {
//     try {
//       const { days = 30 } = req.query;
//       const dailyData = await Revenue.getDailyRevenue(days);
      
//       res.status(200).json({
//         success: true,
//         data: dailyData.map(d => ({
//           date: d._id,
//           revenue: d.revenue,
//           orders: d.orders,
//         })),
//       });
//     } catch (error) {
//       logger.error('Get daily revenue error:', error.message);
//       next(error);
//     }
//   },

//   // Create revenue record (called when order is completed)
//   async createRevenue(req, res, next) {
//     try {
//       const revenueData = {
//         ...req.body,
//         revenueDate: req.body.revenueDate || new Date(),
//       };
      
//       const revenue = await Revenue.create(revenueData);
      
//       logger.info(`✅ Revenue recorded: $${revenue.amount} (${revenue.type})`);
      
//       res.status(201).json({
//         success: true,
//         data: revenue,
//         message: 'Revenue recorded successfully',
//       });
//     } catch (error) {
//       logger.error('Create revenue error:', error.message);
//       next(error);
//     }
//   },

//   // Get revenue by category
//   async getRevenueByCategory(req, res, next) {
//     try {
//       const { startDate, endDate } = req.query;
      
//       const match = { status: 'completed' };
//       if (startDate || endDate) {
//         match.revenueDate = {};
//         if (startDate) match.revenueDate.$gte = new Date(startDate);
//         if (endDate) match.revenueDate.$lte = new Date(endDate);
//       }
      
//       const categoryData = await Revenue.aggregate([
//         { $match: match },
//         { $group: { _id: '$category', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
//         { $sort: { revenue: -1 } }
//       ]);
      
//       res.status(200).json({
//         success: true,
//         data: categoryData.map(c => ({
//           category: c._id,
//           revenue: c.revenue,
//           count: c.count,
//         })),
//       });
//     } catch (error) {
//       logger.error('Get revenue by category error:', error.message);
//       next(error);
//     }
//   },

//   // Get revenue summary for dashboard
//   async getRevenueSummary(req, res, next) {
//     try {
//       const now = new Date();
//       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const thisYear = new Date(now.getFullYear(), 0, 1);
      
//       const [todayRevenue, monthRevenue, yearRevenue, totalRevenue] = await Promise.all([
//         Revenue.getTotalRevenue(today, now),
//         Revenue.getTotalRevenue(thisMonth, now),
//         Revenue.getTotalRevenue(thisYear, now),
//         Revenue.getTotalRevenue(),
//       ]);
      
//       const revenueChange = await Revenue.getRevenueChange();
      
//       res.status(200).json({
//         success: true,
//         data: {
//           today: todayRevenue.total || 0,
//           thisMonth: monthRevenue.total || 0,
//           thisYear: yearRevenue.total || 0,
//           allTime: totalRevenue.total || 0,
//           totalOrders: totalRevenue.count || 0,
//           revenueChange: revenueChange.change || 0,
//           todayOrders: todayRevenue.count || 0,
//           monthOrders: monthRevenue.count || 0,
//         },
//       });
//     } catch (error) {
//       logger.error('Get revenue summary error:', error.message);
//       next(error);
//     }
//   },
// };

// module.exports = revenueController;






























// controllers/revenueController.js (Admin Panel)
const { auditService } = require('../services/auditService');
const { cacheService } = require('../services/cacheService');
const axios = require('axios');
const logger = require('../config/logger');

const revenueController = {
  // Get total revenue stats
  async getTotalRevenue(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      // ✅ Fetch from e-commerce store API
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/revenue/total`, {
        params: { startDate, endDate },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      await auditService.log({
        admin: req.admin._id,
        action: 'read',
        resource: 'revenue',
        details: { type: 'total', startDate, endDate },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      logger.error('Get total revenue error:', error.message);
      next(error);
    }
  },

  // Get monthly revenue chart data
  async getMonthlyRevenue(req, res, next) {
    try {
      const { year } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/revenue/monthly`, {
        params: { year },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      res.status(200).json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      logger.error('Get monthly revenue error:', error.message);
      next(error);
    }
  },

  // Get daily revenue chart data
  async getDailyRevenue(req, res, next) {
    try {
      const { days = 30 } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/revenue/daily`, {
        params: { days },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      res.status(200).json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      logger.error('Get daily revenue error:', error.message);
      next(error);
    }
  },

  // Get revenue summary for dashboard
  async getRevenueSummary(req, res, next) {
    try {
      // Cache for 5 minutes
      const cacheKey = 'revenue:summary';
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        return res.status(200).json({
          success: true,
          data: cachedData
        });
      }

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/revenue/summary`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      // Cache the result
      await cacheService.set(cacheKey, response.data.data, 300);

      await auditService.log({
        admin: req.admin._id,
        action: 'read',
        resource: 'revenue',
        details: { type: 'summary' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      logger.error('Get revenue summary error:', error.message);
      next(error);
    }
  },

  // Get revenue by category
  async getRevenueByCategory(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/revenue/by-category`, {
        params: { startDate, endDate },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      res.status(200).json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      logger.error('Get revenue by category error:', error.message);
      next(error);
    }
  },

  // Export revenue report
  async exportRevenueReport(req, res, next) {
    try {
      const { startDate, endDate, format = 'excel' } = req.query;
      const ExcelJS = require('exceljs');
      const moment = require('moment');

      // Fetch all revenue data
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/revenue/daily`, {
        params: { 
          days: 365,
          startDate, 
          endDate 
        },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      if (format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Revenue Report');

        worksheet.columns = [
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Revenue', key: 'revenue', width: 15 },
          { header: 'Orders', key: 'orders', width: 10 },
          { header: 'Average Order Value', key: 'avgValue', width: 20 },
        ];

        response.data.data.forEach(row => {
          worksheet.addRow({
            date: row.date,
            revenue: row.revenue,
            orders: row.orders,
            avgValue: row.orders > 0 ? (row.revenue / row.orders).toFixed(2) : 0
          });
        });

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };

        // Add currency format
        worksheet.getColumn('revenue').numFmt = '$#,##0.00';
        worksheet.getColumn('avgValue').numFmt = '$#,##0.00';

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${moment().format('YYYY-MM-DD')}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
      }

      await auditService.log({
        admin: req.admin._id,
        action: 'export',
        resource: 'revenue',
        details: { format, startDate, endDate },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    } catch (error) {
      logger.error('Export revenue error:', error.message);
      next(error);
    }
  },

  // Refresh revenue cache
  async refreshRevenueCache(req, res, next) {
    try {
      await cacheService.delPattern('revenue:*');
      
      res.status(200).json({
        success: true,
        message: 'Revenue cache cleared successfully'
      });
    } catch (error) {
      logger.error('Refresh revenue cache error:', error.message);
      next(error);
    }
  }
};

module.exports = revenueController;

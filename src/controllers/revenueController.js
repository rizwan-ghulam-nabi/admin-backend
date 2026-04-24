const Revenue = require('../models/Revenue');
const { AppError } = require('../utils/AppError');
const logger = require('../config/logger');

const revenueController = {
  // Get total revenue stats
  async getTotalRevenue(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      const totalRevenue = await Revenue.getTotalRevenue(startDate, endDate);
      const revenueChange = await Revenue.getRevenueChange();
      
      res.status(200).json({
        success: true,
        data: {
          totalRevenue: totalRevenue.total || 0,
          totalOrders: totalRevenue.count || 0,
          revenueChange: revenueChange.change || 0,
          currentMonth: revenueChange.currentMonth || 0,
          previousMonth: revenueChange.previousMonth || 0,
        }
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
      const monthlyData = await Revenue.getMonthlyRevenue(year);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const chartData = months.map((month, index) => {
        const found = monthlyData.find(m => m._id.month === index + 1);
        return {
          name: month,
          revenue: found ? found.revenue : 0,
          orders: found ? found.orders : 0,
        };
      });
      
      res.status(200).json({
        success: true,
        data: chartData,
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
      const dailyData = await Revenue.getDailyRevenue(days);
      
      res.status(200).json({
        success: true,
        data: dailyData.map(d => ({
          date: d._id,
          revenue: d.revenue,
          orders: d.orders,
        })),
      });
    } catch (error) {
      logger.error('Get daily revenue error:', error.message);
      next(error);
    }
  },

  // Create revenue record (called when order is completed)
  async createRevenue(req, res, next) {
    try {
      const revenueData = {
        ...req.body,
        revenueDate: req.body.revenueDate || new Date(),
      };
      
      const revenue = await Revenue.create(revenueData);
      
      logger.info(`✅ Revenue recorded: $${revenue.amount} (${revenue.type})`);
      
      res.status(201).json({
        success: true,
        data: revenue,
        message: 'Revenue recorded successfully',
      });
    } catch (error) {
      logger.error('Create revenue error:', error.message);
      next(error);
    }
  },

  // Get revenue by category
  async getRevenueByCategory(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      const match = { status: 'completed' };
      if (startDate || endDate) {
        match.revenueDate = {};
        if (startDate) match.revenueDate.$gte = new Date(startDate);
        if (endDate) match.revenueDate.$lte = new Date(endDate);
      }
      
      const categoryData = await Revenue.aggregate([
        { $match: match },
        { $group: { _id: '$category', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } }
      ]);
      
      res.status(200).json({
        success: true,
        data: categoryData.map(c => ({
          category: c._id,
          revenue: c.revenue,
          count: c.count,
        })),
      });
    } catch (error) {
      logger.error('Get revenue by category error:', error.message);
      next(error);
    }
  },

  // Get revenue summary for dashboard
  async getRevenueSummary(req, res, next) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisYear = new Date(now.getFullYear(), 0, 1);
      
      const [todayRevenue, monthRevenue, yearRevenue, totalRevenue] = await Promise.all([
        Revenue.getTotalRevenue(today, now),
        Revenue.getTotalRevenue(thisMonth, now),
        Revenue.getTotalRevenue(thisYear, now),
        Revenue.getTotalRevenue(),
      ]);
      
      const revenueChange = await Revenue.getRevenueChange();
      
      res.status(200).json({
        success: true,
        data: {
          today: todayRevenue.total || 0,
          thisMonth: monthRevenue.total || 0,
          thisYear: yearRevenue.total || 0,
          allTime: totalRevenue.total || 0,
          totalOrders: totalRevenue.count || 0,
          revenueChange: revenueChange.change || 0,
          todayOrders: todayRevenue.count || 0,
          monthOrders: monthRevenue.count || 0,
        },
      });
    } catch (error) {
      logger.error('Get revenue summary error:', error.message);
      next(error);
    }
  },
};

module.exports = revenueController;
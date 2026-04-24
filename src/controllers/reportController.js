const { auditService } = require('../services/auditService');
const { cacheService } = require('../services/cacheService');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const moment = require('moment');

const reportController = {
  // Sales report
  async getSalesReport(req, res, next) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/reports/sales`, {
        params: { startDate, endDate, groupBy },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      await auditService.log({
        admin: req.admin._id,
        action: 'read',
        resource: 'report',
        details: { type: 'sales', startDate, endDate, groupBy },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(200).json({
        success: true,
        data: response.data.data,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Products report
  async getProductsReport(req, res, next) {
    try {
      const { sortBy = 'sales', limit = 50 } = req.query;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/reports/products`, {
        params: { sortBy, limit },
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
  
  // Users report
  async getUsersReport(req, res, next) {
    try {
      const { period = 'month' } = req.query;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/reports/users`, {
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
  
  // Export sales report as Excel
  async exportSalesReportExcel(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/reports/sales`, {
        params: { startDate, endDate, groupBy: 'day' },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');
      
      // Add headers
      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Orders', key: 'orders', width: 10 },
        { header: 'Revenue', key: 'revenue', width: 15 },
        { header: 'Average Order Value', key: 'avgOrderValue', width: 20 },
      ];
      
      // Add data
      response.data.data.forEach(row => {
        worksheet.addRow(row);
      });
      
      // Style header row
      worksheet.getRow(1).font = { bold: true };
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${moment().format('YYYY-MM-DD')}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
      
      await auditService.log({
        admin: req.admin._id,
        action: 'export',
        resource: 'report',
        details: { type: 'sales', format: 'excel', startDate, endDate },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Export sales report as PDF
  async exportSalesReportPDF(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/reports/sales`, {
        params: { startDate, endDate, groupBy: 'day' },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });
      
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${moment().format('YYYY-MM-DD')}.pdf`);
      
      doc.pipe(res);
      
      // Add content
      doc.fontSize(20).text('Sales Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
      doc.moveDown();
      
      // Add table
      const tableTop = 150;
      let currentTop = tableTop;
      
      doc.fontSize(10);
      doc.text('Date', 50, currentTop);
      doc.text('Orders', 150, currentTop);
      doc.text('Revenue', 250, currentTop);
      doc.text('Avg Order', 350, currentTop);
      
      currentTop += 20;
      response.data.data.forEach(row => {
        doc.text(row.date, 50, currentTop);
        doc.text(row.orders.toString(), 150, currentTop);
        doc.text(`$${row.revenue.toFixed(2)}`, 250, currentTop);
        doc.text(`$${row.avgOrderValue.toFixed(2)}`, 350, currentTop);
        currentTop += 20;
      });
      
      doc.end();
      
      await auditService.log({
        admin: req.admin._id,
        action: 'export',
        resource: 'report',
        details: { type: 'sales', format: 'pdf', startDate, endDate },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Inventory report
  async getInventoryReport(req, res, next) {
    try {
      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/reports/inventory`, {
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
};

module.exports = reportController;
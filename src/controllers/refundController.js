// src/controllers/refundController.js
const { auditService } = require('../services/auditService');
const { cacheService } = require('../services/cacheService');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const moment = require('moment');

const refundController = {
  // Get all refunds with filters
  async getRefunds(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        reason,
        startDate, 
        endDate,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/refunds`, {
        params: { page, limit, status, reason, startDate, endDate, search, sortBy, sortOrder },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      await auditService.log({
        admin: req.admin._id,
        action: 'read',
        resource: 'refund',
        details: { type: 'list', filters: { status, reason, startDate, endDate, search } },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single refund
  async getRefundById(req, res, next) {
    try {
      const { id } = req.params;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/refunds/${id}`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      await auditService.log({
        admin: req.admin._id,
        action: 'read',
        resource: 'refund',
        details: { type: 'single', refundId: id },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({ success: true, data: response.data.data });
    } catch (error) {
      next(error);
    }
  },

  // Create refund
  async createRefund(req, res, next) {
    try {
      const { orderId, amount, reason, reasonDetails, paymentId } = req.body;

      const response = await axios.post(`${process.env.CUSTOMER_API_URL}/refunds`, {
        order: orderId,
        amount,
        reason,
        reasonDetails,
        payment: paymentId,
        processedBy: req.admin._id
      }, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      await auditService.log({
        admin: req.admin._id,
        action: 'create',
        resource: 'refund',
        details: { refundId: response.data.data._id, orderId, amount, reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Clear caches
      if (cacheService) {
        await cacheService.del('refunds:list');
        await cacheService.del('refunds:stats');
        await cacheService.delPattern('refunds:reports:*');
      }

      res.status(201).json({
        success: true,
        message: 'Refund created successfully',
        data: response.data.data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update refund status
  async updateRefundStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes, transactionId } = req.body;

      const response = await axios.patch(
        `${process.env.CUSTOMER_API_URL}/refunds/${id}/status`,
        { status, notes, transactionId, processedBy: req.admin._id },
        { headers: { 'x-api-key': process.env.CUSTOMER_API_KEY } }
      );

      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'refund',
        details: { refundId: id, newStatus: status, notes },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Clear caches
      if (cacheService) {
        await cacheService.del(`refund:${id}`);
        await cacheService.del('refunds:list');
        await cacheService.del('refunds:stats');
        await cacheService.delPattern('refunds:reports:*');
      }

      res.status(200).json({
        success: true,
        message: `Refund status updated to ${status}`,
        data: response.data.data,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get refund statistics
  async getRefundStats(req, res, next) {
    try {
      const { startDate, endDate, period = 'day' } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/refunds/stats`, {
        params: { startDate, endDate, period },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      res.status(200).json({ success: true, data: response.data.data });
    } catch (error) {
      next(error);
    }
  },

  // Get refund trends
  async getRefundTrends(req, res, next) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/refunds/trends`, {
        params: { startDate, endDate, groupBy },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      res.status(200).json({ success: true, data: response.data.data });
    } catch (error) {
      next(error);
    }
  },

  // Get refund by reason
  async getRefundByReason(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/refunds/by-reason`, {
        params: { startDate, endDate },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      res.status(200).json({ success: true, data: response.data.data });
    } catch (error) {
      next(error);
    }
  },

  // Get refund rate
  async getRefundRateReport(req, res, next) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/refunds/rate`, {
        params: { startDate, endDate, groupBy },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      res.status(200).json({ success: true, data: response.data.data });
    } catch (error) {
      next(error);
    }
  },

  // Get refund by product
  async getRefundByProduct(req, res, next) {
    try {
      const { startDate, endDate, limit = 20 } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/refunds/by-product`, {
        params: { startDate, endDate, limit },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      res.status(200).json({ success: true, data: response.data.data });
    } catch (error) {
      next(error);
    }
  },

  // Get daily summary
  async getDailyRefundSummary(req, res, next) {
    try {
      const { date } = req.query;
      const targetDate = date || moment().format('YYYY-MM-DD');

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/refunds/daily-summary`, {
        params: { date: targetDate },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      res.status(200).json({ success: true, data: response.data.data });
    } catch (error) {
      next(error);
    }
  },

  // Export to Excel
  async exportRefundsExcel(req, res, next) {
    try {
      const { startDate, endDate, status, reason } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/refunds`, {
        params: { startDate, endDate, status, reason, limit: 10000 },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Refunds Report');

      worksheet.columns = [
        { header: 'Refund ID', key: 'refundId', width: 15 },
        { header: 'Store Refund ID', key: 'storeRefundId', width: 20 },
        { header: 'Order ID', key: 'orderId', width: 20 },
        { header: 'Payment ID', key: 'paymentId', width: 20 },
        { header: 'Customer ID', key: 'customerId', width: 20 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Currency', key: 'currency', width: 8 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Reason', key: 'reason', width: 25 },
        { header: 'Reason Details', key: 'reasonDetails', width: 30 },
        { header: 'Transaction ID', key: 'transactionId', width: 20 },
        { header: 'Request Date', key: 'createdAt', width: 15 },
        { header: 'Processed Date', key: 'processedAt', width: 15 },
      ];

      response.data.data.forEach(refund => {
        worksheet.addRow({
          refundId: refund._id,
          storeRefundId: refund.refundId,
          orderId: refund.order?._id || refund.order,
          paymentId: refund.payment?._id || refund.payment,
          customerId: refund.user?._id || refund.user,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
          reason: refund.reason,
          reasonDetails: refund.reasonDetails || 'N/A',
          transactionId: refund.transactionId || 'N/A',
          createdAt: moment(refund.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          processedAt: refund.processedAt ? moment(refund.processedAt).format('YYYY-MM-DD HH:mm:ss') : 'Not processed',
        });
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

      // Color code status cells
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const statusCell = row.getCell('status');
          switch (statusCell.value) {
            case 'pending': statusCell.font = { color: { argb: 'FF9C27B0' } }; break;
            case 'processing': statusCell.font = { color: { argb: 'FF2196F3' } }; break;
            case 'completed': statusCell.font = { color: { argb: 'FF4CAF50' } }; break;
            case 'failed': statusCell.font = { color: { argb: 'FFF44336' } }; break;
            case 'cancelled': statusCell.font = { color: { argb: 'FF9E9E9E' } }; break;
          }
        }
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=refunds-report-${moment().format('YYYY-MM-DD')}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

      if (auditService) {
        await auditService.log({
          admin: req.admin._id,
          action: 'export',
          resource: 'refund',
          details: { type: 'excel', startDate, endDate },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // Export to PDF
  async exportRefundsPDF(req, res, next) {
    try {
      const { startDate, endDate, status } = req.query;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/refunds`, {
        params: { startDate, endDate, status, limit: 500 },
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=refunds-report-${moment().format('YYYY-MM-DD')}.pdf`);

      doc.pipe(res);

      // Header
      doc.fontSize(20).text('Refunds Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, { align: 'center' });
      
      if (startDate && endDate) {
        doc.text(`Period: ${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')}`, { align: 'center' });
      }
      doc.moveDown(2);

      // Summary
      const totalAmount = response.data.data.reduce((sum, refund) => sum + refund.amount, 0);
      doc.fontSize(14).text('Summary', { underline: true });
      doc.fontSize(10);
      doc.text(`Total Refunds: ${response.data.pagination?.total || response.data.data.length}`);
      doc.text(`Total Amount: $${totalAmount.toFixed(2)}`);
      doc.moveDown(2);

      // Table
      doc.fontSize(14).text('Refund Details', { underline: true });
      doc.moveDown();
      
      const tableTop = doc.y;
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('Refund ID', 50, tableTop);
      doc.text('Amount', 150, tableTop);
      doc.text('Status', 230, tableTop);
      doc.text('Reason', 300, tableTop);
      doc.text('Date', 420, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      doc.font('Helvetica');
      let yPosition = tableTop + 20;

      response.data.data.forEach(refund => {
        if (yPosition > doc.page.height - 100) {
          doc.addPage();
          yPosition = 50;
        }

        doc.text(refund.refundId || refund._id, 50, yPosition);
        doc.text(`$${refund.amount.toFixed(2)}`, 150, yPosition);
        doc.text(refund.status, 230, yPosition);
        doc.text(refund.reason, 300, yPosition);
        doc.text(moment(refund.createdAt).format('YYYY-MM-DD'), 420, yPosition);
        
        yPosition += 20;
      });

      // Footer
      doc.fontSize(8).text(
        `Generated by ${req.admin?.name || req.admin?.email || 'Admin'} | ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();

      if (auditService) {
        await auditService.log({
          admin: req.admin._id,
          action: 'export',
          resource: 'refund',
          details: { type: 'pdf', startDate, endDate },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // Get refunds by order
  async getRefundsByOrder(req, res, next) {
    try {
      const { orderId } = req.params;

      const response = await axios.get(`${process.env.CUSTOMER_API_URL}/orders/${orderId}/refunds`, {
        headers: { 'x-api-key': process.env.CUSTOMER_API_KEY }
      });

      res.status(200).json({ success: true, data: response.data.data });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = refundController;
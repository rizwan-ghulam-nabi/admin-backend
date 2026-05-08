// // const express = require('express');
// // const router = express.Router();

// // // Import all route modules
// // const authRoutes = require('./auth.routes');
// // const dashboardRoutes = require('./dashboard.routes');
// // const productRoutes = require('./products.routes');
// // const orderRoutes = require('./orders.routes');
// // const userRoutes = require('./users.routes');
// // const categoryRoutes = require('./categories.routes');
// // const couponRoutes = require('./coupons.routes');
// // const reportRoutes = require('./reports.routes');
// // const settingRoutes = require('./settings.routes');
// // const backupRoutes = require('./backups.routes');
// // const logRoutes = require('./logs.routes');
// // const webhookRoutes = require('./webhooks.routes');
// // const revenueRoutes = require('./revenue.routes');
// // const refundRoutes = require('./refundRoutes'); // ✅ ADD THIS LINE

// // // Register routes
// // router.use('/auth', authRoutes);
// // router.use('/dashboard', dashboardRoutes);
// // router.use('/products', productRoutes);
// // router.use('/orders', orderRoutes);
// // router.use('/users', userRoutes);
// // router.use('/categories', categoryRoutes);
// // router.use('/coupons', couponRoutes);
// // router.use('/reports', reportRoutes);
// // router.use('/settings', settingRoutes);
// // router.use('/backups', backupRoutes);
// // router.use('/logs', logRoutes);
// // router.use('/revenue', revenueRoutes);
// // router.use('/webhooks', webhookRoutes);
// // router.use('/refunds', refundRoutes); // ✅ ADD THIS LINE

// // module.exports = router;





















// // src/routes/v1/index.js
// const express = require('express');
// const router = express.Router();

// // Import all route modules
// const authRoutes = require('./auth.routes');
// const dashboardRoutes = require('./dashboard.routes');
// const productRoutes = require('./products.routes');
// const orderRoutes = require('./orders.routes');
// const userRoutes = require('./users.routes');
// const categoryRoutes = require('./categories.routes');
// const couponRoutes = require('./coupons.routes');
// const reportRoutes = require('./reports.routes');
// const settingRoutes = require('./settings.routes');
// const backupRoutes = require('./backups.routes');
// const logRoutes = require('./logs.routes');
// const webhookRoutes = require('./webhooks.routes');
// const revenueRoutes = require('./revenue.routes');
// const refundRoutes = require('./refundRoutes'); // ✅ ADD THIS
// const supportRoutes = require('./supportRoutes');
// // Register routes
// router.use('/auth', authRoutes);
// router.use('/dashboard', dashboardRoutes);
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);
// router.use('/users', userRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/coupons', couponRoutes);
// router.use('/reports', reportRoutes);
// router.use('/settings', settingRoutes);
// router.use('/backups', backupRoutes);
// router.use('/logs', logRoutes);
// router.use('/revenue', revenueRoutes);
// router.use('/webhooks', webhookRoutes);
// router.use('/refunds', refundRoutes); // ✅ ADD THIS
// router.use('/support', supportRoutes);

// module.exports = router;























// src/routes/v1/index.js
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const productRoutes = require('./products.routes');
const orderRoutes = require('./orders.routes');
const userRoutes = require('./users.routes');
const categoryRoutes = require('./categories.routes');
const couponRoutes = require('./coupons.routes');
const reportRoutes = require('./reports.routes');
const settingRoutes = require('./settings.routes');
const backupRoutes = require('./backups.routes');
const logRoutes = require('./logs.routes');
const webhookRoutes = require('./webhooks.routes');
const revenueRoutes = require('./revenue.routes');
const refundRoutes = require('./refundRoutes');

// ✅ IMPORT MODELS AND MIDDLEWARE FOR SUPPORT TICKETS
const SupportTicket = require('../../models/SupportTicket');
const { protect } = require('../../middleware/auth');

console.log('✅ SupportTicket model loaded for routes');
console.log('✅ protect middleware loaded for routes');

// ============================================
// SUPPORT TICKET ROUTES (DIRECT)
// ============================================

// Test route to verify support routes are working
router.get('/support/test', (req, res) => {
  console.log('✅ Support test route hit!');
  res.json({ success: true, message: 'Support routes are working!' });
});

// GET /api/v1/support/tickets - Get all tickets
router.get('/support/tickets', protect, async (req, res) => {
  console.log('📞 GET /support/tickets endpoint hit');
  try {
    const tickets = await SupportTicket.find().sort('-createdAt');
    console.log(`✅ Found ${tickets.length} tickets`);
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('❌ Error fetching tickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/support/stats - Get ticket statistics
router.get('/support/stats', protect, async (req, res) => {
  console.log('📊 GET /support/stats endpoint hit');
  try {
    const stats = await SupportTicket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const result = { 
      total: 0, 
      pending: 0, 
      'in-progress': 0, 
      resolved: 0, 
      closed: 0 
    };
    
    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });
    
    console.log('📊 Stats result:', result);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/support/tickets/:id/status - Update ticket status
router.put('/support/tickets/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/support/tickets/:id/reply - Reply to ticket
router.post('/support/tickets/:id/reply', protect, async (req, res) => {
  try {
    const { reply } = req.body;
    
    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        adminReply: reply,
        repliedAt: new Date(),
        status: 'in-progress'
      },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/support/tickets/:id - Delete ticket
router.delete('/support/tickets/:id', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/support/contact - Public endpoint for customers
router.post('/support/contact', async (req, res) => {
  try {
    const { name, email, orderNumber, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, subject, and message' 
      });
    }
    
    const ticket = await SupportTicket.create({
      name,
      email,
      orderNumber: orderNumber || null,
      subject,
      message,
      status: 'pending'
    });
    
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// REGULAR ROUTES
// ============================================
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/coupons', couponRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingRoutes);
router.use('/backups', backupRoutes);
router.use('/logs', logRoutes);
router.use('/revenue', revenueRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/refunds', refundRoutes);

console.log('✅ All routes registered including support routes');

module.exports = router;
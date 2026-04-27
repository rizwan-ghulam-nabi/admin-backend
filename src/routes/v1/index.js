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
// const refundRoutes = require('./refundRoutes'); // ✅ ADD THIS LINE

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
// router.use('/refunds', refundRoutes); // ✅ ADD THIS LINE

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
const refundRoutes = require('./refundRoutes'); // ✅ ADD THIS

// Register routes
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
router.use('/refunds', refundRoutes); // ✅ ADD THIS

module.exports = router;
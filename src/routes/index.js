
const express = require('express');
const router = express.Router();
const v1Routes = require('./v1');
const webhookRoutes = require('./v1/webhooks.routes'); // ✅ Correct path - it's in v1 folder

// API version routes
router.use('/v1/admin', v1Routes);
router.use('/webhooks', webhookRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date(),
  });
});

module.exports = router;
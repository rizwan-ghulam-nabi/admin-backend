
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const logger = require('../../config/logger');  // ✅ Correct path - two levels up

// Webhook secret verification middleware
const verifyWebhook = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET || 'default-webhook-secret')
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    logger.warn('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
};

// Payment webhook
router.post('/payment', verifyWebhook, async (req, res) => {
  try {
    const { orderId, status, transactionId, amount } = req.body;
    
    logger.info('Payment webhook received:', { orderId, status, transactionId });
    
    // Process payment webhook
    // Update order status, send notifications, etc.
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Order webhook
router.post('/order', verifyWebhook, async (req, res) => {
  try {
    const { orderId, event, data } = req.body;
    
    logger.info('Order webhook received:', { orderId, event });
    
    // Process order webhook
    // Update inventory, send notifications, etc.
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Order webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Product webhook
router.post('/product', verifyWebhook, async (req, res) => {
  try {
    const { productId, event, data } = req.body;
    
    logger.info('Product webhook received:', { productId, event });
    
    // Process product webhook
    // Update cache, sync data, etc.
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Product webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User webhook
router.post('/user', verifyWebhook, async (req, res) => {
  try {
    const { userId, event, data } = req.body;
    
    logger.info('User webhook received:', { userId, event });
    
    // Process user webhook
    // Update user data, send notifications, etc.
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('User webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
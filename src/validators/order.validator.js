const { body, param } = require('express-validator');

const orderValidators = {
  updateOrderStatus: [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
      .withMessage('Invalid order status'),
    body('note')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Note cannot exceed 500 characters'),
  ],
  
  updatePaymentStatus: [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
    body('paymentStatus')
      .isIn(['pending', 'paid', 'failed', 'refunded'])
      .withMessage('Invalid payment status'),
    body('transactionId')
      .optional()
      .trim(),
  ],
  
  cancelOrder: [
    param('id')
      .isMongoId()
      .withMessage('Invalid order ID'),
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
  ],
};

module.exports = { orderValidators };
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validator');
const { orderValidators } = require('../../validators/order.validator');

router.use(protect);
router.use(checkPermission('orders.view'));

router.get('/', orderController.getAllOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrder);
router.get('/:id/invoice', orderController.generateInvoice);

router.patch('/:id/status',
  checkPermission('orders.update'),
  validate(orderValidators.updateOrderStatus),
  orderController.updateOrderStatus
);

router.patch('/:id/payment',
  checkPermission('orders.update'),
  validate(orderValidators.updatePaymentStatus),
  orderController.updatePaymentStatus
);

router.post('/:id/cancel',
  checkPermission('orders.update'),
  validate(orderValidators.cancelOrder),
  orderController.cancelOrder
);

router.post('/bulk-update',
  checkPermission('orders.update'),
  orderController.bulkUpdateOrders
);

module.exports = router;
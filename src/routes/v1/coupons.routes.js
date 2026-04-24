const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/couponController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validator');
const { couponValidators } = require('../../validators/coupon.validator');

router.use(protect);
router.use(checkPermission('coupons.view'));

router.get('/', couponController.getAllCoupons);
router.get('/stats', checkPermission('coupons.manage'), couponController.getCouponStats);
router.get('/:id', couponController.getCoupon);

router.post('/validate', couponController.validateCoupon);

router.post('/',
  checkPermission('coupons.create'),
  validate(couponValidators.createCoupon),
  couponController.createCoupon
);

router.put('/:id',
  checkPermission('coupons.update'),
  validate(couponValidators.updateCoupon),
  couponController.updateCoupon
);

router.delete('/:id',
  checkPermission('coupons.delete'),
  couponController.deleteCoupon
);

router.post('/bulk-delete',
  checkPermission('coupons.delete'),
  couponController.bulkDeleteCoupons
);

module.exports = router;
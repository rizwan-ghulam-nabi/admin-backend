const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validator');
const { userValidators } = require('../../validators/user.validator');

router.use(protect);
router.use(checkPermission('users.view'));

router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);
router.get('/export', checkPermission('users.manage'), userController.exportUsers);
router.get('/:id', userController.getUser);
router.get('/:id/orders', userController.getUserOrders);

router.post('/',
  checkPermission('users.create'),
  validate(userValidators.createUser),
  userController.createUser
);

router.put('/:id',
  checkPermission('users.update'),
  validate(userValidators.updateUser),
  userController.updateUser
);

router.patch('/:id/status',
  checkPermission('users.update'),
  validate(userValidators.updateUserStatus),
  userController.updateUserStatus
);

router.delete('/:id',
  checkPermission('users.delete'),
  userController.deleteUser
);

module.exports = router;
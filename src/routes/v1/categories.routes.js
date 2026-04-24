const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/categoryController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validator');
const { categoryValidators } = require('../../validators/category.validator');

router.use(protect);

router.get('/', checkPermission('categories.view'), categoryController.getAllCategories);
router.get('/tree', checkPermission('categories.view'), categoryController.getCategoryTree);
router.get('/:id', checkPermission('categories.view'), categoryController.getCategory);

router.post('/',
  checkPermission('categories.create'),
  validate(categoryValidators.createCategory),
  categoryController.createCategory
);

router.put('/:id',
  checkPermission('categories.update'),
  validate(categoryValidators.updateCategory),
  categoryController.updateCategory
);

router.delete('/:id',
  checkPermission('categories.delete'),
  categoryController.deleteCategory
);

router.post('/reorder',
  checkPermission('categories.update'),
  categoryController.reorderCategories
);

module.exports = router;

const express = require('express');
const router = express.Router();
const productController = require('../../controllers/productController');
const { protect } = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');
const upload = require('../../middleware/upload');

router.use(protect);

router.get('/', checkPermission('products.view'), productController.getAllProducts);
router.get('/low-stock', checkPermission('products.view'), productController.getLowStockProducts);
router.get('/:id', checkPermission('products.view'), productController.getProduct);

// ✅ FIXED: Use uploadAny - accepts any field name
router.post('/', 
  checkPermission('products.create'),
  upload.uploadAny(5),
  productController.createProduct
);

router.put('/:id',
  checkPermission('products.update'),
  upload.uploadAny(5),
  productController.updateProduct
);

router.patch('/:id/stock',
  checkPermission('products.update'),
  productController.updateStock
);

router.delete('/:id',
  checkPermission('products.delete'),
  productController.deleteProduct
);

router.post('/bulk-update',
  checkPermission('products.update'),
  productController.bulkUpdateProducts
);

module.exports = router;
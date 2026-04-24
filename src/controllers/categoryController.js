
// const { auditService } = require('../services/auditService');
// const { AppError } = require('../utils/AppError');
// const logger = require('../config/logger');
// const Category = require('../models/Category'); // ✅ Direct database access

// const categoryController = {
//   // Get all categories
//   async getAllCategories(req, res, next) {
//     try {
//       const categories = await Category.find({ isActive: true })
//         .sort('order name');
      
//       res.status(200).json({
//         success: true,
//         data: categories,
//       });
//     } catch (error) {
//       logger.error('Get categories error:', error.message);
//       next(error);
//     }
//   },

//   // Get category tree
//   async getCategoryTree(req, res, next) {
//     try {
//       const categories = await Category.find({ isActive: true })
//         .sort('order name')
//         .lean();
      
//       const buildTree = (parentId = null) => {
//         return categories
//           .filter(cat => String(cat.parent || null) === String(parentId))
//           .map(cat => ({
//             ...cat,
//             children: buildTree(cat._id),
//           }));
//       };
      
//       const tree = buildTree();
      
//       res.status(200).json({
//         success: true,
//         data: tree,
//       });
//     } catch (error) {
//       logger.error('Get category tree error:', error.message);
//       next(error);
//     }
//   },

//   // Get single category
//   async getCategory(req, res, next) {
//     try {
//       const { id } = req.params;
      
//       const category = await Category.findById(id);
      
//       if (!category) {
//         throw new AppError('Category not found', 404);
//       }
      
//       res.status(200).json({
//         success: true,
//         data: category,
//       });
//     } catch (error) {
//       logger.error('Get category error:', error.message);
//       next(error);
//     }
//   },

//   // Create category
//   async createCategory(req, res, next) {
//     try {
//       const { name, description, parent, isActive, order } = req.body;
      
//       if (!name) {
//         throw new AppError('Category name is required', 400);
//       }
      
//       const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
//       const category = await Category.create({
//         name,
//         slug,
//         description: description || '',
//         parent: parent || null,
//         isActive: isActive !== false,
//         order: order || 0,
//       });
      
//       await auditService.log({
//         admin: req.admin._id,
//         action: 'create',
//         resource: 'category',
//         resourceId: category._id,
//         details: { name },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       }).catch(err => logger.error('Audit log failed:', err));
      
//       logger.info(`✅ Category created: ${category.name}`);
      
//       res.status(201).json({
//         success: true,
//         data: category,
//         message: 'Category created successfully',
//       });
//     } catch (error) {
//       logger.error('Create category error:', error.message);
      
//       if (error.code === 11000) {
//         return res.status(400).json({
//           success: false,
//           message: 'Category name already exists',
//         });
//       }
      
//       next(error);
//     }
//   },

//   // Update category
//   async updateCategory(req, res, next) {
//     try {
//       const { id } = req.params;
//       const { name, description, parent, isActive, order } = req.body;
      
//       const updateData = {};
//       if (name) {
//         updateData.name = name;
//         updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
//       }
//       if (description !== undefined) updateData.description = description;
//       if (parent !== undefined) updateData.parent = parent || null;
//       if (isActive !== undefined) updateData.isActive = isActive;
//       if (order !== undefined) updateData.order = order;
      
//       const category = await Category.findByIdAndUpdate(id, updateData, {
//         new: true,
//         runValidators: true,
//       });
      
//       if (!category) {
//         throw new AppError('Category not found', 404);
//       }
      
//       await auditService.log({
//         admin: req.admin._id,
//         action: 'update',
//         resource: 'category',
//         resourceId: id,
//         details: updateData,
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       }).catch(err => logger.error('Audit log failed:', err));
      
//       logger.info(`✅ Category updated: ${category.name}`);
      
//       res.status(200).json({
//         success: true,
//         data: category,
//         message: 'Category updated successfully',
//       });
//     } catch (error) {
//       logger.error('Update category error:', error.message);
      
//       if (error.code === 11000) {
//         return res.status(400).json({
//           success: false,
//           message: 'Category name already exists',
//         });
//       }
      
//       next(error);
//     }
//   },

//   // Delete category
//   async deleteCategory(req, res, next) {
//     try {
//       const { id } = req.params;
      
//       const category = await Category.findByIdAndDelete(id);
      
//       if (!category) {
//         throw new AppError('Category not found', 404);
//       }
      
//       await auditService.log({
//         admin: req.admin._id,
//         action: 'delete',
//         resource: 'category',
//         resourceId: id,
//         details: { name: category.name },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       }).catch(err => logger.error('Audit log failed:', err));
      
//       logger.info(`✅ Category deleted: ${category.name}`);
      
//       res.status(200).json({
//         success: true,
//         message: 'Category deleted successfully',
//       });
//     } catch (error) {
//       logger.error('Delete category error:', error.message);
//       next(error);
//     }
//   },

//   // Reorder categories
//   async reorderCategories(req, res, next) {
//     try {
//       const { categories } = req.body;
      
//       for (const cat of categories) {
//         await Category.findByIdAndUpdate(cat.id, { order: cat.order });
//       }
      
//       await auditService.log({
//         admin: req.admin._id,
//         action: 'update',
//         resource: 'category',
//         details: { action: 'reorder', count: categories.length },
//         ipAddress: req.ip,
//         userAgent: req.get('user-agent'),
//       }).catch(err => logger.error('Audit log failed:', err));
      
//       logger.info(`✅ Reordered ${categories.length} categories`);
      
//       res.status(200).json({
//         success: true,
//         message: 'Categories reordered successfully',
//       });
//     } catch (error) {
//       logger.error('Reorder categories error:', error.message);
//       next(error);
//     }
//   },
// };

// module.exports = categoryController;



































const { AppError } = require('../utils/AppError');
const logger = require('../config/logger');
const Category = require('../models/Category');

// Try to import audit service safely
let auditService;
try {
  auditService = require('../services/auditService');
} catch (error) {
  logger.warn('⚠️ Audit service not available, logging disabled');
  auditService = null;
}

// Try to import cache service safely
let cacheService;
try {
  cacheService = require('../services/cacheService');
} catch (error) {
  logger.warn('⚠️ Cache service not available');
  cacheService = null;
}

// Safe audit log helper
const safeAuditLog = async (data) => {
  try {
    if (auditService && typeof auditService.log === 'function') {
      await auditService.log(data);
    } else {
      logger.info(`📝 [AUDIT] ${data.action} ${data.resource}: ${data.details?.name || data.resourceId || ''}`);
    }
  } catch (error) {
    logger.error('Audit log error (ignored):', error.message);
  }
};

// Safe cache clear helper
const safeClearCache = async (pattern) => {
  try {
    if (cacheService && typeof cacheService.delPattern === 'function') {
      await cacheService.delPattern(pattern);
    }
  } catch (error) {
    logger.error('Cache clear error (ignored):', error.message);
  }
};

const categoryController = {
  // Get all categories
  async getAllCategories(req, res, next) {
    try {
      const categories = await Category.find({ isActive: true })
        .sort('order name');
      
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('❌ Get categories error:', error.message);
      next(error);
    }
  },

  // Get category tree
  async getCategoryTree(req, res, next) {
    try {
      const categories = await Category.find({ isActive: true })
        .sort('order name')
        .lean();
      
      const buildTree = (parentId = null) => {
        return categories
          .filter(cat => String(cat.parent || null) === String(parentId))
          .map(cat => ({
            ...cat,
            children: buildTree(cat._id),
          }));
      };
      
      const tree = buildTree();
      
      res.status(200).json({
        success: true,
        data: tree,
      });
    } catch (error) {
      logger.error('❌ Get category tree error:', error.message);
      next(error);
    }
  },

  // Get single category
  async getCategory(req, res, next) {
    try {
      const { id } = req.params;
      
      const category = await Category.findById(id);
      
      if (!category) {
        throw new AppError('Category not found', 404);
      }
      
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('❌ Get category error:', error.message);
      next(error);
    }
  },

  // Create category
  async createCategory(req, res, next) {
    try {
      const { name, description, parent, isActive, order } = req.body;
      
      if (!name) {
        throw new AppError('Category name is required', 400);
      }
      
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      const category = await Category.create({
        name,
        slug,
        description: description || '',
        parent: parent || null,
        isActive: isActive !== false,
        order: order || 0,
      });
      
      await safeAuditLog({
        admin: req.admin?._id,
        action: 'create',
        resource: 'category',
        resourceId: category._id,
        details: { name },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      await safeClearCache('categories:*');
      
      logger.info(`✅ Category created: ${category.name} (${category._id})`);
      
      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
      });
    } catch (error) {
      logger.error('❌ Create category error:', error.message);
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists',
        });
      }
      
      next(error);
    }
  },

  // Update category
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, parent, isActive, order } = req.body;
      
      const updateData = {};
      if (name) {
        updateData.name = name;
        updateData.slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      if (description !== undefined) updateData.description = description;
      if (parent !== undefined) updateData.parent = parent || null;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (order !== undefined) updateData.order = order;
      
      const category = await Category.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      
      if (!category) {
        throw new AppError('Category not found', 404);
      }
      
      await safeAuditLog({
        admin: req.admin?._id,
        action: 'update',
        resource: 'category',
        resourceId: id,
        details: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      await safeClearCache('categories:*');
      
      logger.info(`✅ Category updated: ${category.name} (${id})`);
      
      res.status(200).json({
        success: true,
        data: category,
        message: 'Category updated successfully',
      });
    } catch (error) {
      logger.error('❌ Update category error:', error.message);
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists',
        });
      }
      
      next(error);
    }
  },

  // Delete category
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      
      const category = await Category.findByIdAndDelete(id);
      
      if (!category) {
        throw new AppError('Category not found', 404);
      }
      
      await safeAuditLog({
        admin: req.admin?._id,
        action: 'delete',
        resource: 'category',
        resourceId: id,
        details: { name: category.name },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      await safeClearCache('categories:*');
      
      logger.info(`✅ Category deleted: ${category.name} (${id})`);
      
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      logger.error('❌ Delete category error:', error.message);
      next(error);
    }
  },

  // Reorder categories
  async reorderCategories(req, res, next) {
    try {
      const { categories } = req.body;
      
      for (const cat of categories) {
        await Category.findByIdAndUpdate(cat.id, { order: cat.order });
      }
      
      await safeAuditLog({
        admin: req.admin?._id,
        action: 'update',
        resource: 'category',
        details: { action: 'reorder', count: categories.length },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      await safeClearCache('categories:*');
      
      logger.info(`✅ Reordered ${categories.length} categories`);
      
      res.status(200).json({
        success: true,
        message: 'Categories reordered successfully',
      });
    } catch (error) {
      logger.error('❌ Reorder categories error:', error.message);
      next(error);
    }
  },
};

module.exports = categoryController;
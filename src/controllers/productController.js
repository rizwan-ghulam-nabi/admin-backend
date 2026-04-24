
const { auditService } = require('../services/auditService');
const { AppError } = require('../utils/AppError');
const logger = require('../config/logger');
const Product = require('../models/Product');
const { mongoose } = require('mongoose');



const Products = mongoose.model('Product');
console.log('📦 Product model from mongoose:', typeof Product, Product?.modelName);

const productController = {
  // Get all products with filters and pagination
  async getAllProducts(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        category, 
        status, 
        sort = '-createdAt' 
      } = req.query;
      
      const query = {};
      
      // Search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
        ];
      }
      
      // Category filter
      if (category) {
        query.category = category;
      }
      
      // Status filter
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
      
      // Count total
      const total = await Product.countDocuments(query);
      
      // Get products
      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
      
      // Transform for frontend
      const transformedProducts = products.map(product => ({
        ...product.toObject(),
        image: product.images?.find(img => img.isMain)?.url || product.images?.[0]?.url || null,
        status: product.isActive ? 'active' : 'inactive',
        category: product.category?.name || product.category,
      }));
      
      logger.info(`📦 Retrieved ${transformedProducts.length} products`);
      
      res.status(200).json({
        success: true,
        data: transformedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('❌ Get products error:', error.message);
      next(error);
    }
  },

  // Get single product by ID
  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      const product = await Product.findById(id).populate('category', 'name slug');
      
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('❌ Get product error:', error.message);
      next(error);
    }
  },

  // Create new product
  async createProduct(req, res, next) {
    try {
      const productData = { ...req.body };
      
      console.log('📦 Creating product with data:', {
        name: productData.name,
        price: productData.price,
        category: productData.category,
        stock: productData.stock,
        description: productData.description?.substring(0, 50),
        sku: productData.sku || 'not provided',
        brand: productData.brand || 'not provided',
        tags: productData.tags,
        isActive: productData.isActive,
        isFeatured: productData.isFeatured,
      });
      
      // Handle uploaded images
      if (req.files && req.files.length > 0) {
        productData.images = req.files.map((file, index) => ({
          public_id: file.filename,
          url: `/uploads/products/${file.filename}`,
          isMain: req.body.mainImageIndex === index.toString(),
        }));
        console.log(`📸 Processed ${req.files.length} images`);
      } else {
        // Provide placeholder image if no images uploaded
        productData.images = [{
          public_id: 'placeholder',
          url: 'https://via.placeholder.com/500x500/4F46E5/FFFFFF?text=No+Image',
          isMain: true,
        }];
      }
      
      // Handle tags (convert string to array)
      if (typeof productData.tags === 'string') {
        productData.tags = productData.tags.split(',').map(t => t.trim()).filter(t => t);
      } else if (!productData.tags) {
        productData.tags = [];
      }
      
      // Convert string numbers to actual numbers
      if (productData.price) productData.price = parseFloat(productData.price) || 0;
      if (productData.comparePrice) productData.comparePrice = parseFloat(productData.comparePrice) || undefined;
      if (productData.stock) productData.stock = parseInt(productData.stock) || 0;
      
      // Handle booleans
      if (productData.isActive === 'true' || productData.isActive === true) {
        productData.isActive = true;
      } else {
        productData.isActive = false;
      }
      
      if (productData.isFeatured === 'true' || productData.isFeatured === true) {
        productData.isFeatured = true;
      } else {
        productData.isFeatured = false;
      }
      
      // Remove empty SKU
      if (!productData.sku || productData.sku.trim() === '') {
        delete productData.sku;
      }
      
      // Ensure description exists
      if (!productData.description) {
        productData.description = '';
      }
      
      console.log('📦 Final product data keys:', Object.keys(productData));
      
      const product = await Product.create(productData);
      
      // Audit log
      await auditService.log({
        admin: req.admin._id,
        action: 'create',
        resource: 'product',
        resourceId: product._id,
        details: { name: product.name, sku: product.sku },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(err => logger.error('Audit log failed:', err));
      
      logger.info(`✅ Product created: ${product.name} (${product._id})`);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      logger.error('❌ Create product error:', error.message);
      
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const errors = {};
        Object.keys(error.errors).forEach(key => {
          errors[key] = error.errors[key].message;
        });
        
        console.error('Validation errors:', errors);
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors,
        });
      }
      
      // Handle duplicate key error (SKU)
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const message = `${field} already exists`;
        
        return res.status(400).json({
          success: false,
          message: message,
          field: field,
        });
      }
      
      // Handle cast errors (invalid ObjectId)
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: `Invalid ${error.path}: ${error.value}`,
        });
      }
      
      next(error);
    }
  },

  // Update product
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Handle uploaded images
      if (req.files && req.files.length > 0) {
        updateData.images = req.files.map((file, index) => ({
          public_id: file.filename,
          url: `/uploads/products/${file.filename}`,
          isMain: req.body.mainImageIndex === index.toString(),
        }));
      }
      
      // Handle tags
      if (typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(t => t);
      }
      
      // Convert types
      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.comparePrice) updateData.comparePrice = parseFloat(updateData.comparePrice);
      if (updateData.stock) updateData.stock = parseInt(updateData.stock);
      if (typeof updateData.isActive === 'string') updateData.isActive = updateData.isActive === 'true';
      if (typeof updateData.isFeatured === 'string') updateData.isFeatured = updateData.isFeatured === 'true';
      
      const product = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'product',
        resourceId: id,
        details: { updatedFields: Object.keys(req.body) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(err => logger.error('Audit log failed:', err));
      
      logger.info(`✅ Product updated: ${product.name} (${id})`);
      
      res.status(200).json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      logger.error('❌ Update product error:', error.message);
      
      if (error.code === 11000) {
        return next(new AppError('SKU already exists', 400));
      }
      
      next(error);
    }
  },

  // Delete product
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      const product = await Product.findByIdAndDelete(id);
      
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      
      await auditService.log({
        admin: req.admin._id,
        action: 'delete',
        resource: 'product',
        resourceId: id,
        details: { name: product.name },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(err => logger.error('Audit log failed:', err));
      
      logger.info(`✅ Product deleted: ${product.name} (${id})`);
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      logger.error('❌ Delete product error:', error.message);
      next(error);
    }
  },

  // Bulk update products
  async bulkUpdateProducts(req, res, next) {
    try {
      const { productIds, updateData } = req.body;
      
      const result = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: updateData }
      );
      
      await auditService.log({
        admin: req.admin._id,
        action: 'update',
        resource: 'product',
        details: { bulk: true, count: productIds.length, modified: result.modifiedCount },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(err => logger.error('Audit log failed:', err));
      
      logger.info(`✅ Bulk updated ${result.modifiedCount} products`);
      
      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} products updated successfully`,
      });
    } catch (error) {
      logger.error('❌ Bulk update error:', error.message);
      next(error);
    }
  },

  // Update product stock
  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      
      const product = await Product.findByIdAndUpdate(
        id,
        { stock: parseInt(stock) },
        { new: true }
      );
      
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      
      logger.info(`✅ Stock updated for ${product.name}: ${stock}`);
      
      res.status(200).json({
        success: true,
        data: product,
        message: 'Stock updated successfully',
      });
    } catch (error) {
      logger.error('❌ Update stock error:', error.message);
      next(error);
    }
  },

  // Get low stock products
  async getLowStockProducts(req, res, next) {
    try {
      const { threshold = 10 } = req.query;
      
      const products = await Product.find({
        stock: { $lte: parseInt(threshold) },
        isActive: true,
      }).populate('category', 'name');
      
      logger.info(`📦 Found ${products.length} low stock products`);
      
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error('❌ Get low stock error:', error.message);
      next(error);
    }
  },
};

module.exports = productController;
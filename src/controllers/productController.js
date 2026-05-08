
// // 27/04/2026

// // controllers/productController.js
// const Product = require('../models/Product');
// const { uploadToCloudinary } = require('../config/cloudinary');
// const { AppError } = require('../utils/AppError');

// // CREATE PRODUCT
// exports.createProduct = async (req, res, next) => {
//   try {
//     const productData = {
//       name: req.body.name,
//       price: Number(req.body.price),
//       stock: Number(req.body.stock),
//       description: req.body.description || '',
//       brand: req.body.brand || '',
//       sku: req.body.sku || '',
//       category: req.body.category || '',
//       isActive: req.body.isActive === 'true' || req.body.isActive === true,
//       isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
//     };

//     // Upload images to Cloudinary
//     if (req.files && req.files.length > 0) {
//       const images = [];
      
//       for (let i = 0; i < req.files.length; i++) {
//         const file = req.files[i];
//         // Use processed image if available, otherwise original buffer
//         const buffer = file.processed || file.buffer;
        
//         const result = await uploadToCloudinary(buffer);
//         images.push({
//           url: result.url,
//           public_id: result.public_id,
//           isMain: i === 0,
//         });
//       }
      
//       productData.images = images;
//       productData.image = images[0].url; // Main image URL
//     }

//     const product = await Product.create(productData);
    
//     res.status(201).json({
//       success: true,
//       message: 'Product created successfully',
//       data: product
//     });
//   } catch (error) {
//     next(new AppError(error.message, 500));
//   }
// };

// // UPDATE PRODUCT
// exports.updateProduct = async (req, res, next) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return next(new AppError('Product not found', 404));
//     }

//     // Update text fields
//     const fields = ['name', 'price', 'stock', 'description', 'brand', 'sku', 'category'];
//     fields.forEach(field => {
//       if (req.body[field] !== undefined) {
//         product[field] = req.body[field];
//       }
//     });
    
//     if (req.body.isActive !== undefined) {
//       product.isActive = req.body.isActive === 'true' || req.body.isActive === true;
//     }

//     // Handle new images
//     if (req.files && req.files.length > 0) {
//       // Delete old images from Cloudinary
//       if (product.images && product.images.length > 0) {
//         const { cloudinary } = require('../config/cloudinary');
//         for (const img of product.images) {
//           if (img.public_id) {
//             await cloudinary.uploader.destroy(img.public_id).catch(() => {});
//           }
//         }
//       }
      
//       // Upload new images
//       const images = [];
//       for (let i = 0; i < req.files.length; i++) {
//         const buffer = req.files[i].processed || req.files[i].buffer;
//         const result = await uploadToCloudinary(buffer);
//         images.push({
//           url: result.url,
//           public_id: result.public_id,
//           isMain: i === 0,
//         });
//       }
      
//       product.images = images;
//       product.image = images[0].url;
//     }

//     await product.save();
    
//     res.json({
//       success: true,
//       message: 'Product updated successfully',
//       data: product
//     });
//   } catch (error) {
//     next(new AppError(error.message, 500));
//   }
// };

// // DELETE PRODUCT
// exports.deleteProduct = async (req, res, next) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return next(new AppError('Product not found', 404));
//     }

//     // Delete images from Cloudinary
//     if (product.images && product.images.length > 0) {
//       const { cloudinary } = require('../config/cloudinary');
//       for (const img of product.images) {
//         if (img.public_id) {
//           await cloudinary.uploader.destroy(img.public_id).catch(() => {});
//         }
//       }
//     }

//     await Product.findByIdAndDelete(req.params.id);
    
//     res.json({
//       success: true,
//       message: 'Product deleted successfully'
//     });
//   } catch (error) {
//     next(new AppError(error.message, 500));
//   }
// };

// // GET ALL PRODUCTS
// // exports.getAllProducts = async (req, res, next) => {
// //   try {
// //     const { page = 1, limit = 20, sort = '-createdAt', search, category, status } = req.query;
    
// //     const query = {};
// //     if (search) query.name = { $regex: search, $options: 'i' };
// //     if (category) query.category = category;
// //     if (status === 'active') query.isActive = true;
// //     if (status === 'inactive') query.isActive = false;

// //     const total = await Product.countDocuments(query);
// //     const products = await Product.find(query)
// //       .sort(sort)
// //       .skip((page - 1) * limit)
// //       .limit(Number(limit));

// //     res.json({
// //       success: true,
// //       data: products,
// //       pagination: {
// //         page: Number(page),
// //         limit: Number(limit),
// //         total,
// //         totalPages: Math.ceil(total / limit)
// //       }
// //     });
// //   } catch (error) {
// //     next(new AppError(error.message, 500));
// //   }
// // };



// // GET ALL PRODUCTS
// exports.getAllProducts = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20, sort = '-createdAt', search, category, status } = req.query;
    
//     const query = {};
//     if (search) query.name = { $regex: search, $options: 'i' };
//     if (category) query.category = category;
//     if (status === 'active') query.isActive = true;
//     if (status === 'inactive') query.isActive = false;

//     const total = await Product.countDocuments(query);
//     const products = await Product.find(query)
//       .populate('category', 'name slug description') // ✅ ADD THIS LINE
//       .sort(sort)
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     res.json({
//       success: true,
//       data: products,
//       pagination: {
//         page: Number(page),
//         limit: Number(limit),
//         total,
//         totalPages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     next(new AppError(error.message, 500));
//   }
// };




// // GET SINGLE PRODUCT
// // exports.getProduct = async (req, res, next) => {
// //   try {
// //     const product = await Product.findById(req.params.id);
// //     if (!product) {
// //       return next(new AppError('Product not found', 404));
// //     }
// //     res.json({ success: true, data: product });
// //   } catch (error) {
// //     next(new AppError(error.message, 500));
// //   }
// // };



// // GET SINGLE PRODUCT
// exports.getProduct = async (req, res, next) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .populate('category', 'name slug description'); // ✅ ADD THIS LINE
    
//     if (!product) {
//       return next(new AppError('Product not found', 404));
//     }
//     res.json({ success: true, data: product });
//   } catch (error) {
//     next(new AppError(error.message, 500));
//   }
// };




// // UPDATE STOCK
// exports.updateStock = async (req, res, next) => {
//   try {
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       { stock: req.body.stock },
//       { new: true }
//     );
//     res.json({ success: true, data: product });
//   } catch (error) {
//     next(new AppError(error.message, 500));
//   }
// };

// // BULK UPDATE
// exports.bulkUpdateProducts = async (req, res, next) => {
//   try {
//     const { productIds, updateData } = req.body;
//     await Product.updateMany(
//       { _id: { $in: productIds } },
//       { $set: updateData }
//     );
//     res.json({ success: true, message: 'Products updated' });
//   } catch (error) {
//     next(new AppError(error.message, 500));
//   }
// };

// // LOW STOCK
// exports.getLowStockProducts = async (req, res, next) => {
//   try {
//     const threshold = req.query.threshold || 10;
//     const products = await Product.find({ stock: { $lt: threshold } });
//     res.json({ success: true, data: products });
//   } catch (error) {
//     next(new AppError(error.message, 500));
//   }
// };








































// 27/04/2026

// controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category'); // ✅ ADD THIS - Import Category model
const { uploadToCloudinary } = require('../config/cloudinary');
const { AppError } = require('../utils/AppError');

// CREATE PRODUCT
exports.createProduct = async (req, res, next) => {
  try {
    // ✅ Validate category exists
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return next(new AppError('Invalid category ID. Category does not exist.', 400));
      }
    }

    const productData = {
      name: req.body.name,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      description: req.body.description || '',
      brand: req.body.brand || '',
      sku: req.body.sku || '',
      category: req.body.category || null, // ✅ Changed from '' to null
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
    };

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      const images = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // Use processed image if available, otherwise original buffer
        const buffer = file.processed || file.buffer;
        
        const result = await uploadToCloudinary(buffer);
        images.push({
          url: result.url,
          public_id: result.public_id,
          isMain: i === 0,
        });
      }
      
      productData.images = images;
      productData.image = images[0].url; // Main image URL
    }

    const product = await Product.create(productData);
    
    // ✅ Populate category before sending response
    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // ✅ Validate new category if being updated
    if (req.body.category && req.body.category !== product.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return next(new AppError('Invalid category ID. Category does not exist.', 400));
      }
    }

    // Update text fields
    const fields = ['name', 'price', 'stock', 'description', 'brand', 'sku', 'category'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });
    
    if (req.body.isActive !== undefined) {
      product.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    
    if (req.body.isFeatured !== undefined) {
      product.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        const { cloudinary } = require('../config/cloudinary');
        for (const img of product.images) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id).catch(() => {});
          }
        }
      }
      
      // Upload new images
      const images = [];
      for (let i = 0; i < req.files.length; i++) {
        const buffer = req.files[i].processed || req.files[i].buffer;
        const result = await uploadToCloudinary(buffer);
        images.push({
          url: result.url,
          public_id: result.public_id,
          isMain: i === 0,
        });
      }
      
      product.images = images;
      product.image = images[0].url;
    }

    await product.save();
    
    // ✅ Populate category before sending response
    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: populatedProduct
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const { cloudinary } = require('../config/cloudinary');
      for (const img of product.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id).catch(() => {});
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// GET ALL PRODUCTS
exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', search, category, status } = req.query;
    
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug description') // ✅ Populate category
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// GET SINGLE PRODUCT
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description'); // ✅ Populate category
    
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// UPDATE STOCK
exports.updateStock = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: req.body.stock },
      { new: true }
    ).populate('category', 'name'); // ✅ Added populate
    
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// BULK UPDATE
exports.bulkUpdateProducts = async (req, res, next) => {
  try {
    const { productIds, updateData } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return next(new AppError('Product IDs array is required', 400));
    }
    
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );
    
    res.json({ 
      success: true, 
      message: `${productIds.length} products updated successfully` 
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// LOW STOCK
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Product.find({ stock: { $lt: threshold } })
      .populate('category', 'name'); // ✅ Added populate
    
    res.json({ 
      success: true, 
      data: products,
      count: products.length,
      threshold: threshold
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
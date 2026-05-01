
const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  comparePrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,  // ✅ Changed from ObjectId to String
    required: [true, 'Product category is required'],
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    public_id: String,
    url: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  brand: String,
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
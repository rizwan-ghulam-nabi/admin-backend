require('dotenv').config();
const mongoose = require('mongoose');

// Define Category schema directly here (no need to import model)
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Create slug from name
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

const categories = [
  { name: 'Electronics', description: 'Electronic devices and accessories' },
  { name: 'Fashion', description: 'Clothing, shoes, and accessories' },
  { name: 'Books', description: 'Books and publications' },
  { name: 'Home & Garden', description: 'Home decor and garden supplies' },
  { name: 'Sports', description: 'Sports equipment and outdoor gear' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      
      if (existing) {
        console.log(`⏭️ Category already exists: ${cat.name} → ${existing._id}`);
      } else {
        const category = await Category.create(cat);
        console.log(`✅ Created category: ${category.name} → ${category._id}`);
      }
    }

    // Show all categories
    const allCategories = await Category.find();
    console.log('\n📋 All Categories:');
    allCategories.forEach(cat => {
      console.log(`   ${cat.name}: ${cat._id}`);
    });

    await mongoose.disconnect();
    console.log('\n✨ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
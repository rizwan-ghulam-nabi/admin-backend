const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../src/models/Product');
const Category = require('../src/models/Category');

async function fixProductCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // =========================
    // 1. Get all categories
    // =========================
    const categories = await Category.find();
    
    if (categories.length === 0) {
      console.log('❌ No categories found! Please create categories first.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`\n📁 Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat._id})`);
    });

    // =========================
    // 2. Get all products
    // =========================
    const products = await Product.find();
    console.log(`\n📦 Found ${products.length} total products`);

    // Create array of valid category IDs
    const validCategoryIds = categories.map(c => c._id.toString());
    
    // Find products with invalid categories
    const productsToFix = [];
    const validProducts = [];

    products.forEach(product => {
      const categoryId = product.category ? product.category.toString() : null;
      
      if (!categoryId || !validCategoryIds.includes(categoryId)) {
        productsToFix.push(product);
      } else {
        validProducts.push(product);
      }
    });

    console.log(`\n✅ Products with valid categories: ${validProducts.length}`);
    console.log(`🔧 Products needing fix: ${productsToFix.length}`);

    if (productsToFix.length === 0) {
      console.log('🎉 All products already have valid categories! Nothing to fix.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // =========================
    // 3. Show products that need fixing
    // =========================
    console.log('\n📋 Products to fix:');
    productsToFix.forEach(product => {
      console.log(`   - ${product.name} (Current category: ${product.category || 'None'})`);
    });

    // =========================
    // 4. Choose default category (use first category)
    // =========================
    const defaultCategory = categories[0];
    console.log(`\n✨ Using category: "${defaultCategory.name}" for all products`);

    // =========================
    // 5. Update all products
    // =========================
    let updated = 0;
    let failed = 0;

    for (const product of productsToFix) {
      try {
        product.category = defaultCategory._id;
        await product.save();
        updated++;
        console.log(`   ✅ Updated: ${product.name}`);
      } catch (error) {
        failed++;
        console.log(`   ❌ Failed: ${product.name} - ${error.message}`);
      }
    }

    // =========================
    // 6. Show results
    // =========================
    console.log('\n📊 Update Complete!');
    console.log(`✅ Successfully updated: ${updated} products`);
    console.log(`❌ Failed: ${failed} products`);

    // =========================
    // 7. Final verification
    // =========================
    const finalProducts = await Product.find();
    const stillInvalid = finalProducts.filter(p => {
      const catId = p.category ? p.category.toString() : null;
      return !validCategoryIds.includes(catId);
    });

    if (stillInvalid.length === 0) {
      console.log('\n🎉 All products now have valid categories!');
      console.log('\n📋 Updated Products:');
      finalProducts.forEach(product => {
        const category = categories.find(c => c._id.toString() === product.category?.toString());
        console.log(`   - ${product.name} → Category: ${category?.name || 'Unknown'}`);
      });
    } else {
      console.log(`\n⚠️ ${stillInvalid.length} products still have issues.`);
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Setup Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
fixProductCategories();
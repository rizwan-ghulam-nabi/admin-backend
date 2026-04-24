require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check if Super Admin role exists
    let superAdminRole = await db.collection('adminroles').findOne({ name: process.env.ADMIN_NAME });
    
    if (!superAdminRole) {
      const result = await db.collection('adminroles').insertOne({
        name: process.env.ADMIN_NAME ,
        description: 'Super Administrator with full system access',
        permissions: ['*'],
        isSystem: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      superAdminRole = { _id: result.insertedId };
      console.log('✅ Super Admin role created');
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    
    // Delete existing admin if any
    await db.collection('admins').deleteOne({ email: process.env.ADMIN_EMAIL });
    
    // Create new admin
    await db.collection('admins').insertOne({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: superAdminRole._id,
      permissions: ['*'],
      status: 'active',
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📋 Login Credentials:');
    console.log(`Email : ${process.env.ADMIN_EMAIL}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD }`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAdmin();
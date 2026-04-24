require('dotenv').config();
const mongoose = require('mongoose');

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // 1. Create/Update Super Admin Role
    let superAdminRole = await db.collection('adminroles').findOne({ name: 'Super Admin' });
    
    if (!superAdminRole) {
      const result = await db.collection('adminroles').insertOne({
        name: 'Super Admin',
        description: 'Full system access',
        permissions: ['*'],
        isSystem: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      superAdminRole = { _id: result.insertedId };
      console.log('✅ Super Admin role created');
    } else {
      // Update existing role
      await db.collection('adminroles').updateOne(
        { _id: superAdminRole._id },
        { $set: { permissions: ['*'] } }
      );
      console.log('✅ Super Admin role updated');
    }
    
    // 2. Update Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    const admin = await db.collection('admins').findOne({ email: adminEmail });
    
    if (admin) {
      await db.collection('admins').updateOne(
        { email: adminEmail },
        { 
          $set: { 
            role: superAdminRole._id,
            permissions: ['*'],
            status: 'active'
          } 
        }
      );
      console.log('✅ Admin updated with Super Admin role');
    } else {
      // Create admin if not exists
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || 'Admin@123456', 
        10
      );
      
      await db.collection('admins').insertOne({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: superAdminRole._id,
        permissions: ['*'],
        status: 'active',
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ New admin created');
    }
    
    console.log('\n📋 Login Credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
    console.log('\n✅ DONE! Now:');
    console.log('   1. Restart backend: Ctrl+C then npm run dev');
    console.log('   2. Logout from frontend');
    console.log('   3. Login again');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdmin();
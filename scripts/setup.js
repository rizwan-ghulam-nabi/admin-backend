// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// require('dotenv').config();

// async function setup() {
//   try {
//     // Use your existing database connection string
//     const MONGODB_URI = process.env.MONGODB_URI;
//     console.log('Connecting to:', MONGODB_URI);
    
//     await mongoose.connect(MONGODB_URI);
//     console.log('✅ Connected to MongoDB');
    
//     // Get the database name from connection
//     const db = mongoose.connection.db;
//     const databaseName = mongoose.connection.name;
//     console.log(`📚 Database: ${databaseName}`);
    
//     // 1. Check if roles collection exists, if not create it
//     const rolesCollection = db.collection('adminroles');
//     const existingRole = await rolesCollection.findOne({ name: 'Super Admin' });
    
//     let roleId;
//     if (!existingRole) {
//       const roleResult = await rolesCollection.insertOne({
//         name: 'Super Admin',
//         description: 'Super Administrator with full system access',
//         permissions: [
//           'dashboard.view',
//           'products.view', 'products.create', 'products.update', 'products.delete',
//           'orders.view', 'orders.update', 'orders.delete',
//           'users.view', 'users.create', 'users.update', 'users.delete',
//           'categories.view', 'categories.create', 'categories.update', 'categories.delete',
//           'coupons.view', 'coupons.create', 'coupons.update', 'coupons.delete',
//           'reports.view', 'reports.export',
//           'settings.view', 'settings.update', 'settings.manage',
//           'admins.view', 'admins.create', 'admins.update', 'admins.delete',
//           'logs.view',
//           'backups.view', 'backups.create', 'backups.restore'
//         ],
//         isSystem: true,
//         status: 'active',
//         createdAt: new Date(),
//         updatedAt: new Date()
//       });
//       roleId = roleResult.insertedId;
//       console.log('✅ Super Admin Role created');
//     } else {
//       roleId = existingRole._id;
//       console.log('✅ Super Admin Role already exists');
//     }
    
//     // 2. Check if admin exists
//     const adminsCollection = db.collection('admins');
//     const existingAdmin = await adminsCollection.findOne({ email: 'admin@example.com' });
    
//     if (!existingAdmin) {
//       const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      
//       await adminsCollection.insertOne({
//         name: 'Super Admin',
//         email: 'admin@example.com',
//         password: hashedPassword,
//         role: roleId,
//         status: 'active',
//         twoFactorEnabled: false,
//         permissions: [
//           'dashboard.view',
//           'products.view', 'products.create', 'products.update', 'products.delete',
//           'orders.view', 'orders.update',
//           'users.view', 'users.create', 'users.update', 'users.delete',
//           'categories.view', 'categories.create', 'categories.update', 'categories.delete',
//           'coupons.view', 'coupons.create', 'coupons.update', 'coupons.delete',
//           'reports.view', 'reports.export',
//           'settings.view', 'settings.update',
//           'logs.view'
//         ],
//         createdAt: new Date(),
//         updatedAt: new Date()
//       });
//       console.log('✅ Admin user created successfully!');
//     } else {
//       console.log('✅ Admin user already exists');
//     }
    
//     console.log('\n📋 Login Credentials:');
//     console.log('   Email: admin@example.com');
//     console.log('   Password: Admin@123456');
//     console.log('   URL: http://localhost:3000');
    
//     await mongoose.disconnect();
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Setup Error:', error);
//     process.exit(1);
//   }
// }

// setup();








const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require("../src/models/Admin");
const AdminRole = require('../src/models/AdminRole');

async function setup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // =========================
    // 1. Create Role using MODEL
    // =========================
    let role = await AdminRole.findOne({ name: 'Super Admin' });

    if (!role) {
      role = await AdminRole.create({
        name: 'Super Admin',
        description: 'Super Administrator with full system access',
        permissions: [
          'dashboard.view',
          'products.view', 'products.create', 'products.update', 'products.delete',
          'orders.view', 'orders.update', 'orders.delete',
          'users.view', 'users.create', 'users.update', 'users.delete',
          'categories.view', 'categories.create', 'categories.update', 'categories.delete',
          'coupons.view', 'coupons.create', 'coupons.update', 'coupons.delete',
          'reports.view', 'reports.export',
          'settings.view', 'settings.update', 'settings.manage',
          'admins.view', 'admins.create', 'admins.update', 'admins.delete',
          'logs.view',
          'backups.view', 'backups.create', 'backups.restore'
        ],
        isSystem: true,
        status: 'active',
      });

      console.log('✅ Super Admin Role created');
    } else {
      console.log('ℹ️ Role already exists');
    }

    // =========================
    // 2. Create Admin using MODEL
    // =========================
    let admin = await Admin.findOne({ email: 'admin@example.com' });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);

      admin = await Admin.create({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: role._id,
        status: 'active',
        permissions: role.permissions,
      });

      console.log('✅ Admin user created successfully!');
    } else {
      console.log('ℹ️ Admin already exists');
    }

    console.log('\n📋 Login Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123456');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Setup Error:', error);
    process.exit(1);
  }
}

setup();
const mongoose = require('mongoose');

const adminPermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  module: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  actions: [{
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'manage'],
  }],
}, {
  timestamps: true,
});

// Predefined permissions
const predefinedPermissions = [
  // Dashboard
  { name: 'dashboard.view', module: 'dashboard', actions: ['read'] },
  
  // Products
  { name: 'products.view', module: 'products', actions: ['read'] },
  { name: 'products.create', module: 'products', actions: ['create'] },
  { name: 'products.update', module: 'products', actions: ['update'] },
  { name: 'products.delete', module: 'products', actions: ['delete'] },
  { name: 'products.manage', module: 'products', actions: ['manage'] },
  
  // Orders
  { name: 'orders.view', module: 'orders', actions: ['read'] },
  { name: 'orders.update', module: 'orders', actions: ['update'] },
  { name: 'orders.delete', module: 'orders', actions: ['delete'] },
  { name: 'orders.manage', module: 'orders', actions: ['manage'] },
  
  // Users
  { name: 'users.view', module: 'users', actions: ['read'] },
  { name: 'users.create', module: 'users', actions: ['create'] },
  { name: 'users.update', module: 'users', actions: ['update'] },
  { name: 'users.delete', module: 'users', actions: ['delete'] },
  { name: 'users.manage', module: 'users', actions: ['manage'] },
  
  // Categories
  { name: 'categories.view', module: 'categories', actions: ['read'] },
  { name: 'categories.create', module: 'categories', actions: ['create'] },
  { name: 'categories.update', module: 'categories', actions: ['update'] },
  { name: 'categories.delete', module: 'categories', actions: ['delete'] },
  
  // Coupons
  { name: 'coupons.view', module: 'coupons', actions: ['read'] },
  { name: 'coupons.create', module: 'coupons', actions: ['create'] },
  { name: 'coupons.update', module: 'coupons', actions: ['update'] },
  { name: 'coupons.delete', module: 'coupons', actions: ['delete'] },
  
  // Reports
  { name: 'reports.view', module: 'reports', actions: ['read'] },
  { name: 'reports.export', module: 'reports', actions: ['manage'] },
  
  // Settings
  { name: 'settings.view', module: 'settings', actions: ['read'] },
  { name: 'settings.update', module: 'settings', actions: ['update'] },
  { name: 'settings.manage', module: 'settings', actions: ['manage'] },
  
  // Admin Management
  { name: 'admins.view', module: 'admins', actions: ['read'] },
  { name: 'admins.create', module: 'admins', actions: ['create'] },
  { name: 'admins.update', module: 'admins', actions: ['update'] },
  { name: 'admins.delete', module: 'admins', actions: ['delete'] },
  
  // Roles
  { name: 'roles.view', module: 'roles', actions: ['read'] },
  { name: 'roles.create', module: 'roles', actions: ['create'] },
  { name: 'roles.update', module: 'roles', actions: ['update'] },
  { name: 'roles.delete', module: 'roles', actions: ['delete'] },
  
  // Logs
  { name: 'logs.view', module: 'logs', actions: ['read'] },
  
  // Backups
  { name: 'backups.view', module: 'backups', actions: ['read'] },
  { name: 'backups.create', module: 'backups', actions: ['create'] },
  { name: 'backups.restore', module: 'backups', actions: ['manage'] },
];

const AdminPermission = mongoose.model('AdminPermission', adminPermissionSchema);

module.exports = { AdminPermission, predefinedPermissions };
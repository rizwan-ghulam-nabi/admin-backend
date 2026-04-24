// const mongoose = require('mongoose');

// const adminLogSchema = new mongoose.Schema({
//   admin: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Admin',
//     required: true,
//   },
//   action: {
//     type: String,
//     required: true,
//     enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'settings_change'],
//   },
//   resource: {
//     type: String,
//     required: true,
//   },
//   resourceId: {
//     type: String,
//   },
//   details: {
//     type: mongoose.Schema.Types.Mixed,
//   },
//   ipAddress: {
//     type: String,
//     required: true,
//   },
//   userAgent: {
//     type: String,
//   },
//   status: {
//     type: String,
//     enum: ['success', 'failed'],
//     default: 'success',
//   },
//   errorMessage: {
//     type: String,
//   },
//   oldData: {
//     type: mongoose.Schema.Types.Mixed,
//   },
//   newData: {
//     type: mongoose.Schema.Types.Mixed,
//   },
// }, {
//   timestamps: true,
// });

// // Index for efficient queries
// adminLogSchema.index({ admin: 1, createdAt: -1 });
// adminLogSchema.index({ action: 1, createdAt: -1 });
// adminLogSchema.index({ resource: 1, resourceId: 1 });

// const AdminLog = mongoose.model('AdminLog', adminLogSchema);
// module.exports = AdminLog;












const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'settings_change'],
  },
  resource: {
    type: String,
    required: true,
  },
  resourceId: {
    type: String,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'], // ✅ ADD 'pending' HERE
    default: 'success',
  },
  errorMessage: {
    type: String,
  },
  oldData: {
    type: mongoose.Schema.Types.Mixed,
  },
  newData: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
adminLogSchema.index({ admin: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ resource: 1, resourceId: 1 });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);
module.exports = AdminLog;
const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
  },
  permissions: [{
    type: String,
    required: true,
  }],
  isSystem: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
}, {
  timestamps: true,
});

const AdminRole = mongoose.model('AdminRole', adminRoleSchema);
module.exports = AdminRole;
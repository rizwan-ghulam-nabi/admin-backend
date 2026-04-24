const mongoose = require('mongoose');

const adminSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    default: 'string',
  },
  group: {
    type: String,
    default: 'general',
  },
  description: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
}, {
  timestamps: true,
});

const AdminSetting = mongoose.model('AdminSetting', adminSettingSchema);
module.exports = AdminSetting;
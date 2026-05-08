const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    sparse: true  // ✅ Allow null/undefined
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  orderNumber: {
    type: String,
    default: null
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  adminReply: {
    type: String,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate ticket number before saving
supportTicketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    try {
      const count = await mongoose.model('SupportTicket').countDocuments();
      this.ticketNumber = `TKT${String(count + 1).padStart(5, '0')}`;
      console.log(`✅ Generated ticket number: ${this.ticketNumber}`);
    } catch (error) {
      console.error('Error generating ticket number:', error);
      // Fallback to timestamp-based ticket number
      this.ticketNumber = `TKT${Date.now()}`;
    }
  }
  next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
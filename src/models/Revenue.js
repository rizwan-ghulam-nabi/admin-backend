const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  // Revenue amount
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  // Revenue type
  type: {
    type: String,
    enum: ['sale', 'refund', 'adjustment', 'other'],
    default: 'sale'
  },
  // Associated order ID (if from sale)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  // Associated product ID (for reference)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  // Customer ID
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash', 'other'],
  },
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  // Transaction ID
  transactionId: String,
  // Description/Notes
  description: String,
  // Date of revenue
  revenueDate: {
    type: Date,
    default: Date.now
  },
  // Category for analytics
  category: {
    type: String,
    default: 'general'
  },
  // Currency
  currency: {
    type: String,
    default: 'USD'
  },
  // Tax amount
  tax: {
    type: Number,
    default: 0
  },
  // Shipping amount
  shipping: {
    type: Number,
    default: 0
  },
  // Discount applied
  discount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
revenueSchema.index({ revenueDate: -1 });
revenueSchema.index({ type: 1, revenueDate: -1 });
revenueSchema.index({ status: 1 });

// Statics for analytics
revenueSchema.statics.getTotalRevenue = async function(startDate, endDate) {
  const match = {
    status: 'completed',
    type: { $in: ['sale', 'adjustment'] }
  };
  
  if (startDate || endDate) {
    match.revenueDate = {};
    if (startDate) match.revenueDate.$gte = new Date(startDate);
    if (endDate) match.revenueDate.$lte = new Date(endDate);
  }
  
  const result = await this.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
  
  return result[0] || { total: 0, count: 0 };
};

revenueSchema.statics.getMonthlyRevenue = async function(year) {
  const targetYear = year || new Date().getFullYear();
  
  return await this.aggregate([
    {
      $match: {
        status: 'completed',
        revenueDate: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { month: { $month: '$revenueDate' } },
        revenue: { $sum: '$amount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.month': 1 } }
  ]);
};

revenueSchema.statics.getDailyRevenue = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        status: 'completed',
        revenueDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { 
          $dateToString: { format: '%Y-%m-%d', date: '$revenueDate' } 
        },
        revenue: { $sum: '$amount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

revenueSchema.statics.getRevenueChange = async function() {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const [thisMonthRevenue, lastMonthRevenue] = await Promise.all([
    this.getTotalRevenue(thisMonth, now),
    this.getTotalRevenue(lastMonth, endOfLastMonth)
  ]);
  
  const thisMonthTotal = thisMonthRevenue.total || 0;
  const lastMonthTotal = lastMonthRevenue.total || 0;
  
  let change = 0;
  if (lastMonthTotal > 0) {
    change = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  }
  
  return {
    currentMonth: thisMonthTotal,
    previousMonth: lastMonthTotal,
    change: Math.round(change * 100) / 100
  };
};

const Revenue = mongoose.model('Revenue', revenueSchema);
module.exports = Revenue;
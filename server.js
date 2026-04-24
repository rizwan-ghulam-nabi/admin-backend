require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./src/config/logger');
const app = require('./src/app');



// ============================================
// 🚨 LOAD ALL MODELS FIRST (CRITICAL)
// ============================================
require('./src/models/Admin');
require('./src/models/AdminRole');
require('./src/models/AdminSession');
require('./src/models/AdminLog');
require('./src/models/AdminPermission');
require('./src/models/AdminSetting');
require('./src/models/Product');      // ✅ ADD THIS
require('./src/models/Category');     // ✅ ADD THIS
require('./src/models/Category');     // ✅ ADD THIS
console.log('📦 Registered Mongoose models:', Object.keys(mongoose.models));


// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(error.name, error.message, error.stack);
  process.exit(1);
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Start server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  logger.info(`Admin panel server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});
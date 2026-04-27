// src/config/redis.js
const { createClient } = require('redis');
const logger = require('./logger');

let redisClient = null;

const initRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        reconnectStrategy: (retries) => {
          // ✅ STOP retrying after 1 attempt
          if (retries > 1) {
            logger.warn('⚠️ Redis not available - using memory store');
            return new Error('Stop retrying');
          }
          return 1000;
        },
      },
    });

    redisClient.on('error', () => {
      // ✅ Don't log connection refused errors
    });

    await redisClient.connect();
    logger.info('✅ Redis connected');
    return redisClient;
  } catch (error) {
    // ✅ Silent fail - no more error spam
    logger.warn('⚠️ Redis not available - using memory store');
    return null;
  }
};

initRedis();

module.exports = { redisClient, initRedis };
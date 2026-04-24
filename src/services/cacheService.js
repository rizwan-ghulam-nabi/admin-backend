const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

class CacheService {
  constructor() {
    this.defaultTTL = 3600; // 1 hour
  }
  
  async get(key) {
    try {
      if (!redisClient || !redisClient.isReady) return null;
      
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!redisClient || !redisClient.isReady) return false;
      
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }
  
  async del(key) {
    try {
      if (!redisClient || !redisClient.isReady) return false;
      
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }
  
  async delPattern(pattern) {
    try {
      if (!redisClient || !redisClient.isReady) return false;
      
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache pattern delete error:', error);
      return false;
    }
  }
  
  async flush() {
    try {
      if (!redisClient || !redisClient.isReady) return false;
      
      await redisClient.flushAll();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }
  
  async remember(key, callback, ttl = this.defaultTTL) {
    let data = await this.get(key);
    
    if (data === null) {
      data = await callback();
      await this.set(key, data, ttl);
    }
    
    return data;
  }
  
  async increment(key, increment = 1) {
    try {
      if (!redisClient || !redisClient.isReady) return null;
      
      const value = await redisClient.incrBy(key, increment);
      return value;
    } catch (error) {
      logger.error('Cache increment error:', error);
      return null;
    }
  }
  
  async expire(key, ttl) {
    try {
      if (!redisClient || !redisClient.isReady) return false;
      
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error('Cache expire error:', error);
      return false;
    }
  }
}

module.exports = new CacheService();
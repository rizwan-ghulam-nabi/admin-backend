

const rateLimit = require('express-rate-limit');
const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

// Redis store implementation without rate-limit-redis package
class RedisStore {
    constructor(options = {}) {
        this.client = options.client;
        this.prefix = options.prefix || 'rl:';
        this.windowMs = options.windowMs || 60000;
    }

    async increment(key) {
        const now = Date.now();
        const redisKey = `${this.prefix}${key}`;
        
        try {
            // Add current timestamp to sorted set
            await this.client.zAdd(redisKey, { score: now, value: now.toString() });
            
            // Remove entries older than window
            const minScore = now - this.windowMs;
            await this.client.zRemRangeByScore(redisKey, 0, minScore);
            
            // Get count of entries in window
            const count = await this.client.zCard(redisKey);
            
            // Set expiry on the key
            await this.client.expire(redisKey, Math.ceil(this.windowMs / 1000));
            
            return {
                totalHits: count,
                resetTime: new Date(now + this.windowMs)
            };
        } catch (error) {
            logger.error('Redis rate limiter error:', error);
            // Fallback to in-memory
            return { totalHits: 0, resetTime: new Date(now + this.windowMs) };
        }
    }

    async decrement(key) {
        const redisKey = `${this.prefix}${key}`;
        try {
            await this.client.zPopMin(redisKey);
        } catch (error) {
            logger.error('Redis decrement error:', error);
        }
    }

    async resetKey(key) {
        const redisKey = `${this.prefix}${key}`;
        try {
            await this.client.del(redisKey);
        } catch (error) {
            logger.error('Redis reset error:', error);
        }
    }
}

// Check if Redis is available
let store;
if (redisClient && redisClient.isReady) {
    try {
        store = new RedisStore({ client: redisClient });
        logger.info('✅ Using Redis store for rate limiting');
    } catch (error) {
        logger.warn('⚠️ Failed to create Redis store, using memory store');
        store = new (class MemoryStore {
            constructor() {
                this.store = new Map();
            }
            async increment(key) {
                const now = Date.now();
                const windowMs = 60000;
                if (!this.store.has(key)) this.store.set(key, []);
                const timestamps = this.store.get(key);
                const validTimestamps = timestamps.filter(t => now - t < windowMs);
                validTimestamps.push(now);
                this.store.set(key, validTimestamps);
                return { totalHits: validTimestamps.length, resetTime: new Date(now + windowMs) };
            }
            async decrement(key) { /* optional */ }
            async resetKey(key) { this.store.delete(key); }
        })();
    }
} else {
    // Memory store fallback
    store = new (class MemoryStore {
        constructor() {
            this.store = new Map();
        }
        async increment(key) {
            const now = Date.now();
            const windowMs = 60000;
            if (!this.store.has(key)) this.store.set(key, []);
            const timestamps = this.store.get(key);
            const validTimestamps = timestamps.filter(t => now - t < windowMs);
            validTimestamps.push(now);
            this.store.set(key, validTimestamps);
            return { totalHits: validTimestamps.length, resetTime: new Date(now + windowMs) };
        }
        async decrement(key) { /* optional */ }
        async resetKey(key) { this.store.delete(key); }
    })();
    logger.info('📝 Using memory store for rate limiting');
}

// General rate limiter
const rateLimiter = rateLimit({
    store: store,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.connection?.remoteAddress || 'unknown';
    },
});

// Authentication rate limiter
const authLimiter = rateLimit({
    store: store,
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.body?.email || req.ip || req.connection?.remoteAddress || 'unknown';
    },
});

// API rate limiter
const apiLimiter = rateLimit({
    store: store,
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: {
        success: false,
        message: 'API rate limit exceeded.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { rateLimiter, authLimiter, apiLimiter };
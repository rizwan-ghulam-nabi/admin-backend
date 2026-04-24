const otpGenerator = require('otp-generator');
const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

// Fallback memory store for development
const memoryStore = {};

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(memoryStore).forEach(key => {
    if (memoryStore[key].expires < now) {
      delete memoryStore[key];
    }
  });
}, 60000);

const otpService = {
  /**
   * Generate OTP for email
   */
  async generateOTP(email) {
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    
    const key = `otp:${email}`;
    
    if (redisClient && redisClient.isReady) {
      await redisClient.setEx(key, 600, otp); // 10 minutes expiry
    } else {
      memoryStore[key] = { otp, expires: Date.now() + 600000 };
    }
    
    logger.info(`🔢 OTP generated for ${email}`);
    return otp;
  },

  /**
   * Verify OTP for email
   */
  async verifyOTP(email, otp) {
    const key = `otp:${email}`;
    let storedOTP;
    
    if (redisClient && redisClient.isReady) {
      storedOTP = await redisClient.get(key);
      if (storedOTP) {
        await redisClient.del(key); // Delete after verification
      }
    } else {
      const entry = memoryStore[key];
      if (entry && entry.expires > Date.now()) {
        storedOTP = entry.otp;
        delete memoryStore[key];
      }
    }
    
    const isValid = storedOTP === otp;
    logger.info(`${isValid ? '✅' : '❌'} OTP verification for ${email}`);
    return isValid;
  },

  /**
   * Clear OTP for email
   */
  async clearOTP(email) {
    const key = `otp:${email}`;
    if (redisClient && redisClient.isReady) {
      await redisClient.del(key);
    } else {
      delete memoryStore[key];
    }
  },

  /**
   * Check if OTP exists and is valid
   */
  async hasValidOTP(email) {
    const key = `otp:${email}`;
    
    if (redisClient && redisClient.isReady) {
      const otp = await redisClient.get(key);
      return !!otp;
    } else {
      const entry = memoryStore[key];
      return entry && entry.expires > Date.now();
    }
  },
};

module.exports = otpService;
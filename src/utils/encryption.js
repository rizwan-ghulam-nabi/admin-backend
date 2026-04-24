const crypto = require('crypto');

class Encryption {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.key = crypto.createHash('sha256').update(this.secretKey).digest('base64').substr(0, 32);
  }
  
  // Encrypt data
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      iv: iv.toString('hex'),
      content: encrypted,
    };
  }
  
  // Decrypt data
  decrypt(encryptedData) {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const encryptedText = Buffer.from(encryptedData.content, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  // Hash data (one-way)
  hash(text, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.pbkdf2Sync(text, salt, 1000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }
  
  // Verify hash
  verifyHash(text, hash, salt) {
    const { hash: newHash } = this.hash(text, salt);
    return newHash === hash;
  }
  
  // Generate random token
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
  
  // Encrypt object
  encryptObject(obj) {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }
  
  // Decrypt object
  decryptObject(encryptedData) {
    const decryptedString = this.decrypt(encryptedData);
    return JSON.parse(decryptedString);
  }
}

module.exports = new Encryption();
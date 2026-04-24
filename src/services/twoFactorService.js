const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TwoFactorService {
  generateSecret(email, issuer = process.env.TWO_FACTOR_APP_NAME || 'AdminPanel') {
    const secret = speakeasy.generateSecret({
      name: `${issuer}:${email}`,
      length: 20,
    });
    
    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }
  
  async generateQRCode(otpauthUrl) {
    try {
      const qrCode = await QRCode.toDataURL(otpauthUrl);
      return qrCode;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }
  
  verify(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1,
    });
  }
  
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}

module.exports = new TwoFactorService();
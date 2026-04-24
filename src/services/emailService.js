// const nodemailer = require('nodemailer');
// const logger = require('../config/logger');

// class EmailService {
//   constructor() {
//     this.transporter = null;
//     this.init();
//   }
  
//   init() {
//     if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
//       this.transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: parseInt(process.env.SMTP_PORT) || 587,
//         secure: process.env.SMTP_PORT === '465',
//         auth: {
//           user: process.env.SMTP_USER,
//           pass: process.env.SMTP_PASS,
//         },
//       });
//     } else {
//       logger.warn('Email service not configured. Skipping email initialization.');
//     }
//   }
  
//   async sendEmail(to, subject, html, text = null) {
//     if (!this.transporter) {
//       logger.warn('Email service not configured. Email not sent:', { to, subject });
//       return false;
//     }
    
//     try {
//       const info = await this.transporter.sendMail({
//         from: process.env.EMAIL_FROM || 'noreply@adminpanel.com',
//         to,
//         subject,
//         text: text || this.stripHtml(html),
//         html,
//       });
      
//       logger.info('Email sent:', { messageId: info.messageId, to, subject });
//       return true;
//     } catch (error) {
//       logger.error('Email sending failed:', error);
//       return false;
//     }
//   }
  
//   async sendWelcomeEmail(email, name) {
//     const subject = 'Welcome to Our Platform';
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2>Welcome ${name}!</h2>
//         <p>Thank you for joining our platform. We're excited to have you on board.</p>
//         <p>If you have any questions, feel free to contact our support team.</p>
//         <br>
//         <p>Best regards,<br>Admin Team</p>
//       </div>
//     `;
    
//     return this.sendEmail(email, subject, html);
//   }
  
//   async sendOrderStatusUpdate(email, { orderId, status, note }) {
//     const subject = `Order #${orderId} Status Update`;
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2>Order Status Update</h2>
//         <p>Your order #${orderId} has been updated to: <strong>${status}</strong></p>
//         ${note ? `<p>Note: ${note}</p>` : ''}
//         <p>You can track your order status in your account dashboard.</p>
//         <br>
//         <p>Thank you for shopping with us!</p>
//       </div>
//     `;
    
//     return this.sendEmail(email, subject, html);
//   }
  
//   async sendAccountStatusEmail(email, status, reason) {
//     const subject = `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`;
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2>Account Status Update</h2>
//         <p>Your account has been ${status}.</p>
//         ${reason ? `<p>Reason: ${reason}</p>` : ''}
//         <p>If you have any questions, please contact our support team.</p>
//       </div>
//     `;
    
//     return this.sendEmail(email, subject, html);
//   }
  
//   async sendPasswordResetEmail(email, resetToken) {
//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
//     const subject = 'Password Reset Request';
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2>Password Reset Request</h2>
//         <p>You requested to reset your password. Click the link below to reset it:</p>
//         <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
//         <p>This link will expire in 10 minutes.</p>
//         <p>If you didn't request this, please ignore this email.</p>
//       </div>
//     `;
    
//     return this.sendEmail(email, subject, html);
//   }
  
//   stripHtml(html) {
//     return html.replace(/<[^>]*>/g, '');
//   }
// }

// module.exports = new EmailService();






const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }
  
  init() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      logger.info('✅ Email service initialized');
    } else {
      logger.warn('⚠️ Email service not configured. Skipping email initialization.');
    }
  }
  
  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      logger.warn('Email service not configured. Email not sent:', { to, subject });
      return false;
    }
    
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@adminpanel.com',
        to,
        subject,
        text: text || this.stripHtml(html),
        html,
      });
      
      logger.info('📧 Email sent:', { messageId: info.messageId, to, subject });
      return true;
    } catch (error) {
      logger.error('❌ Email sending failed:', error);
      return false;
    }
  }

  // ============================================
  // OTP VERIFICATION EMAIL
  // ============================================
  async sendOTP(email, otp, name = 'Admin') {
    const subject = '🔐 Admin Panel - Login Verification Code';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          h2 { color: #2563eb; margin-bottom: 20px; }
          .otp { font-size: 42px; font-weight: bold; color: #1e40af; letter-spacing: 8px; text-align: center; margin: 30px 0; background: #f0f4ff; padding: 15px; border-radius: 8px; }
          .info { color: #6b7280; margin: 20px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          .warning { color: #dc2626; font-size: 13px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🔐 Admin Login Verification</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Someone is attempting to log into your admin account. Use the verification code below to complete the login:</p>
          <div class="otp">${otp}</div>
          <p class="info">This code will expire in <strong>10 minutes</strong>.</p>
          <p class="warning">⚠️ If you didn't request this login, please secure your account immediately.</p>
          <div class="footer">
            <p><strong>RS-Legacy Admin Panel</strong></p>
            <p>This is an automated message, please do not reply.</p>
            <p>${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return this.sendEmail(email, subject, html);
  }

  // ============================================
  // WELCOME EMAIL
  // ============================================
  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to Our Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome ${name}!</h2>
        <p>Thank you for joining our platform. We're excited to have you on board.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <br>
        <p>Best regards,<br>Admin Team</p>
      </div>
    `;
    
    return this.sendEmail(email, subject, html);
  }

  // ============================================
  // ORDER STATUS UPDATE EMAIL
  // ============================================
  async sendOrderStatusUpdate(email, { orderId, status, note }) {
    const subject = `Order #${orderId} Status Update`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Status Update</h2>
        <p>Your order #${orderId} has been updated to: <strong>${status}</strong></p>
        ${note ? `<p>Note: ${note}</p>` : ''}
        <p>You can track your order status in your account dashboard.</p>
        <br>
        <p>Thank you for shopping with us!</p>
      </div>
    `;
    
    return this.sendEmail(email, subject, html);
  }

  // ============================================
  // ACCOUNT STATUS EMAIL
  // ============================================
  async sendAccountStatusEmail(email, status, reason) {
    const subject = `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Status Update</h2>
        <p>Your account has been ${status}.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `;
    
    return this.sendEmail(email, subject, html);
  }

  // ============================================
  // PASSWORD RESET EMAIL
  // ============================================
  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
    
    return this.sendEmail(email, subject, html);
  }

  // ============================================
  // HELPER: Strip HTML for plain text fallback
  // ============================================
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }
}

module.exports = new EmailService();
const moment = require('moment');

class Formatter {
  // Format response data
  formatResponse(success, data = null, message = null, errors = null) {
    const response = { success };
    
    if (data) response.data = data;
    if (message) response.message = message;
    if (errors) response.errors = errors;
    
    return response;
  }
  
  // Format success response
  success(data = null, message = 'Success') {
    return this.formatResponse(true, data, message);
  }
  
  // Format error response
  error(message = 'Error', errors = null, data = null) {
    return this.formatResponse(false, data, message, errors);
  }
  
  // Format product data
  formatProduct(product) {
    return {
      id: product._id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      formattedPrice: this.formatCurrency(product.price),
      stock: product.stock,
      category: product.category,
      images: product.images,
      status: product.status,
      createdAt: this.formatDate(product.createdAt),
      updatedAt: this.formatDate(product.updatedAt),
    };
  }
  
  // Format order data
  formatOrder(order) {
    return {
      id: order._id,
      orderNumber: order.orderNumber,
      user: order.user,
      items: order.items,
      total: order.total,
      formattedTotal: this.formatCurrency(order.total),
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      createdAt: this.formatDate(order.createdAt),
      updatedAt: this.formatDate(order.updatedAt),
    };
  }
  
  // Format user data
  formatUser(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      createdAt: this.formatDate(user.createdAt),
      updatedAt: this.formatDate(user.updatedAt),
    };
  }
  
  // Format currency
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  // Format date
  formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return null;
    return moment(date).format(format);
  }
  
  // Format relative time
  formatRelativeTime(date) {
    if (!date) return null;
    return moment(date).fromNow();
  }
  
  // Format phone number
  formatPhoneNumber(phone) {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
  }
  
  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Format duration
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  }
  
  // Truncate text
  truncate(text, length = 100, suffix = '...') {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + suffix;
  }
  
  // Camel case to snake case
  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
  
  // Snake case to camel case
  snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  
  // Convert object keys to camel case
  toCamelCase(obj) {
    if (Array.isArray(obj)) {
      return obj.map(v => this.toCamelCase(v));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = this.snakeToCamel(key);
        result[camelKey] = this.toCamelCase(obj[key]);
        return result;
      }, {});
    }
    return obj;
  }
  
  // Convert object keys to snake case
  toSnakeCase(obj) {
    if (Array.isArray(obj)) {
      return obj.map(v => this.toSnakeCase(v));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((result, key) => {
        const snakeKey = this.camelToSnake(key);
        result[snakeKey] = this.toSnakeCase(obj[key]);
        return result;
      }, {});
    }
    return obj;
  }
}

module.exports = new Formatter();
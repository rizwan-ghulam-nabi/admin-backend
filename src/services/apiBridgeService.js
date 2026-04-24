const axios = require('axios');
const logger = require('../config/logger');
const { cacheService } = require('./cacheService');

class ApiBridgeService {
  constructor() {
    this.baseURL = process.env.CUSTOMER_API_URL;
    this.apiKey = process.env.CUSTOMER_API_KEY;
    this.timeout = 30000;
  }
  
  getHeaders() {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }
  
  async request(method, endpoint, data = null, params = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: this.getHeaders(),
        timeout: this.timeout,
      };
      
      if (data) config.data = data;
      if (params) config.params = params;
      
      const response = await axios(config);
      return response.data;
    } catch (error) {
      logger.error('API Bridge request failed:', {
        method,
        endpoint,
        error: error.message,
      });
      
      if (error.response) {
        throw error.response.data;
      }
      throw error;
    }
  }
  
  // Products
  async getProducts(params) {
    return this.request('GET', '/products', null, params);
  }
  
  async getProduct(id) {
    return this.request('GET', `/products/${id}`);
  }
  
  async createProduct(productData) {
    return this.request('POST', '/products', productData);
  }
  
  async updateProduct(id, productData) {
    return this.request('PUT', `/products/${id}`, productData);
  }
  
  async deleteProduct(id) {
    return this.request('DELETE', `/products/${id}`);
  }
  
  // Orders
  async getOrders(params) {
    return this.request('GET', '/orders', null, params);
  }
  
  async getOrder(id) {
    return this.request('GET', `/orders/${id}`);
  }
  
  async updateOrderStatus(id, statusData) {
    return this.request('PATCH', `/orders/${id}/status`, statusData);
  }
  
  // Users
  async getUsers(params) {
    return this.request('GET', '/users', null, params);
  }
  
  async getUser(id) {
    return this.request('GET', `/users/${id}`);
  }
  
  async createUser(userData) {
    return this.request('POST', '/users', userData);
  }
  
  async updateUser(id, userData) {
    return this.request('PUT', `/users/${id}`, userData);
  }
  
  async deleteUser(id) {
    return this.request('DELETE', `/users/${id}`);
  }
  
  // Categories
  async getCategories() {
    const cacheKey = 'bridge:categories';
    let categories = await cacheService.get(cacheKey);
    
    if (!categories) {
      categories = await this.request('GET', '/categories');
      await cacheService.set(cacheKey, categories, 3600);
    }
    
    return categories;
  }
  
  async createCategory(categoryData) {
    const result = await this.request('POST', '/categories', categoryData);
    await cacheService.delPattern('bridge:categories');
    return result;
  }
  
  async updateCategory(id, categoryData) {
    const result = await this.request('PUT', `/categories/${id}`, categoryData);
    await cacheService.delPattern('bridge:categories');
    return result;
  }
  
  async deleteCategory(id) {
    const result = await this.request('DELETE', `/categories/${id}`);
    await cacheService.delPattern('bridge:categories');
    return result;
  }
  
  // Coupons
  async getCoupons(params) {
    return this.request('GET', '/coupons', null, params);
  }
  
  async createCoupon(couponData) {
    return this.request('POST', '/coupons', couponData);
  }
  
  async updateCoupon(id, couponData) {
    return this.request('PUT', `/coupons/${id}`, couponData);
  }
  
  async deleteCoupon(id) {
    return this.request('DELETE', `/coupons/${id}`);
  }
  
  async validateCoupon(code, cartTotal) {
    return this.request('POST', '/coupons/validate', { code, cartTotal });
  }
  
  // Reports
  async getSalesReport(params) {
    return this.request('GET', '/reports/sales', null, params);
  }
  
  async getProductsReport(params) {
    return this.request('GET', '/reports/products', null, params);
  }
  
  async getUsersReport(params) {
    return this.request('GET', '/reports/users', null, params);
  }
  
  // Dashboard
  async getDashboardStats() {
    const cacheKey = 'bridge:dashboard-stats';
    let stats = await cacheService.get(cacheKey);
    
    if (!stats) {
      const [products, orders, users] = await Promise.all([
        this.request('GET', '/products/count'),
        this.request('GET', '/orders/count'),
        this.request('GET', '/users/count'),
      ]);
      
      stats = {
        totalProducts: products.count || 0,
        totalOrders: orders.count || 0,
        totalUsers: users.count || 0,
      };
      
      await cacheService.set(cacheKey, stats, 300);
    }
    
    return stats;
  }
}

module.exports = new ApiBridgeService();
/**
 * @typedef {Object} Admin
 * @property {string} id - Admin ID
 * @property {string} name - Admin name
 * @property {string} email - Admin email
 * @property {string} role - Admin role
 * @property {boolean} twoFactorEnabled - 2FA status
 * @property {string} status - Admin status
 * @property {Date} lastLogin - Last login date
 * @property {Date} createdAt - Creation date
 */

/**
 * @typedef {Object} AdminRole
 * @property {string} id - Role ID
 * @property {string} name - Role name
 * @property {string[]} permissions - Permissions array
 * @property {boolean} isSystem - Is system role
 * @property {string} status - Role status
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Product ID
 * @property {string} name - Product name
 * @property {string} slug - Product slug
 * @property {string} description - Product description
 * @property {number} price - Product price
 * @property {number} stock - Product stock
 * @property {string} category - Category ID
 * @property {string[]} images - Product images
 * @property {string} status - Product status
 */

/**
 * @typedef {Object} Order
 * @property {string} id - Order ID
 * @property {string} orderNumber - Order number
 * @property {string} user - User ID
 * @property {Array} items - Order items
 * @property {number} total - Order total
 * @property {string} status - Order status
 * @property {string} paymentStatus - Payment status
 * @property {Object} shippingAddress - Shipping address
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} avatar - User avatar
 * @property {string} role - User role
 * @property {string} status - User status
 */

/**
 * @typedef {Object} Category
 * @property {string} id - Category ID
 * @property {string} name - Category name
 * @property {string} slug - Category slug
 * @property {string} parent - Parent category ID
 * @property {number} order - Display order
 * @property {string} status - Category status
 */

/**
 * @typedef {Object} Coupon
 * @property {string} id - Coupon ID
 * @property {string} code - Coupon code
 * @property {string} type - Coupon type (percentage/fixed)
 * @property {number} value - Coupon value
 * @property {number} minOrderAmount - Minimum order amount
 * @property {number} maxUses - Maximum uses
 * @property {number} usedCount - Used count
 * @property {Date} validFrom - Valid from date
 * @property {Date} validTo - Valid to date
 * @property {string} status - Coupon status
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Success status
 * @property {*} data - Response data
 * @property {string} message - Response message
 * @property {Array} errors - Validation errors
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page - Page number
 * @property {number} limit - Items per page
 * @property {number} skip - Items to skip
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data - Paginated data
 * @property {Object} pagination - Pagination info
 * @property {number} pagination.page - Current page
 * @property {number} pagination.limit - Items per page
 * @property {number} pagination.total - Total items
 * @property {number} pagination.pages - Total pages
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalProducts - Total products
 * @property {number} totalOrders - Total orders
 * @property {number} totalUsers - Total users
 * @property {number} totalCategories - Total categories
 * @property {number} totalAdmins - Total admins
 * @property {number} totalRevenue - Total revenue
 */

/**
 * @typedef {Object} AuditLog
 * @property {string} id - Log ID
 * @property {string} admin - Admin ID
 * @property {string} action - Action type
 * @property {string} resource - Resource type
 * @property {string} resourceId - Resource ID
 * @property {Object} details - Action details
 * @property {string} ipAddress - IP address
 * @property {string} userAgent - User agent
 * @property {string} status - Status (success/failed)
 * @property {Date} createdAt - Creation date
 */

// Export types for JSDoc
module.exports = {
  // This file is for type definitions only
  // No actual code should be exported
};
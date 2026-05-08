// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const compression = require('compression');
// const mongoSanitize = require('express-mongo-sanitize');
// const session = require('express-session');
// const cookieParser = require('cookie-parser');

// const { redisClient } = require('./config/redis');
// const { rateLimiter } = require('./middleware/rateLimiter');
// const { securityHeaders } = require('./middleware/security');
// const { errorHandler } = require('./middleware/errorHandler');
// const logger = require('./config/logger');
// const routes = require('./routes');
// const mongoose = require('mongoose');

// const app = express();

// /* =========================================================
//    🚨 LOAD ALL MODELS FIRST (CRITICAL FOR MONGOOSE)
// ========================================================= */
// require('./models/Admin');
// require('./models/AdminRole');
// require('./models/AdminSession');
// require('./models/AdminLog');
// require('./models/AdminPermission');
// require('./models/AdminSetting');
// require('./models/Product');      // ✅ ADD THIS
// require('./models/Category');     // ✅ ADD THIS

// /* =========================================================
//    Trust Proxy (for rate limiting behind reverse proxy)
// ========================================================= */
// if (process.env.NODE_ENV === 'production') {
//   app.set('trust proxy', 1);
// }

// /* =========================================================
//    Redis Session Store
// ========================================================= */
// let sessionStore;

// if (redisClient && redisClient.isReady) {
//   try {
//     const connectRedis = require('connect-redis');
//     let RedisStore;

//     if (typeof connectRedis === 'function') {
//       RedisStore = connectRedis(session);
//     } else if (connectRedis?.default) {
//       RedisStore = connectRedis.default(session);
//     } else if (connectRedis?.RedisStore) {
//       RedisStore = connectRedis.RedisStore(session);
//     } else {
//       throw new Error('Unable to initialize connect-redis');
//     }

//     sessionStore = new RedisStore({
//       client: redisClient,
//       prefix: 'sess:',
//     });

//     logger.info('✅ Redis session store initialized');
//   } catch (error) {
//     logger.error('Redis session error:', error.message);
//     logger.warn('⚠️ Falling back to memory store');
//     const MemoryStore = require('memorystore')(session);
//     sessionStore = new MemoryStore({
//       checkPeriod: 86400000,
//     });
//   }
// } else {
//   logger.warn('⚠️ Redis not available, using memory session store');
//   const MemoryStore = require('memorystore')(session);
//   sessionStore = new MemoryStore({
//     checkPeriod: 86400000,
//   });
// }

// /* =========================================================
//    Security & Global Middleware
// ========================================================= */
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com"],
//       imgSrc: ["'self'", "data:", "https:"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
//       connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
//     },
//   },
//   crossOriginEmbedderPolicy: false,
// }));



// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:3001'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));



// app.use(compression());
// app.use(cookieParser());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(mongoSanitize());
// app.use(securityHeaders);

// /* =========================================================
//    Session Middleware
// ========================================================= */
// app.use(session({
//   store: sessionStore,
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   name: 'admin_session_id',
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     maxAge: parseInt(process.env.SESSION_EXPIRES_IN) || 3600000,
//     sameSite: 'strict',
//   },
// }));

// /* =========================================================
//    Rate Limiting
// ========================================================= */
// app.use('/api', rateLimiter);

// /* =========================================================
//    Request Logging
// ========================================================= */
// app.use((req, res, next) => {
//   const startTime = Date.now();
  
//   res.on('finish', () => {
//     const duration = Date.now() - startTime;
//     logger.info(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`, {
//       ip: req.ip,
//       userAgent: req.get('user-agent'),
//     });
//   });
  
//   next();
// });

// /* =========================================================
//    Routes
// ========================================================= */
// // ✅ DEBUG (optional - can remove)
// console.log('=== DEBUG ===');
// console.log('routes type:', typeof routes);
// console.log('routes is Router?', routes.name === 'router');
// console.log('=============');

// app.use('/api', routes);

// /* =========================================================
//    Health Check
// ========================================================= */
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV || 'development',
//     redis: redisClient?.isReady ? 'connected' : 'disconnected',
//     database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//   });
// });

// /* =========================================================
//    404 Handler
// ========================================================= */
// app.use((req, res) => {
//   logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
//   res.status(404).json({
//     success: false,
//     message: `Cannot ${req.method} ${req.url}`,
//     error: 'Route not found',
//   });
// });

// /* =========================================================
//    Global Error Handler
// ========================================================= */
// app.use(errorHandler);

// module.exports = app;


























require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const { redisClient } = require('./config/redis');
const { rateLimiter } = require('./middleware/rateLimiter');
const { securityHeaders } = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');
const routes = require('./routes');
const mongoose = require('mongoose');

const app = express();

/* =========================================================
   🚨 LOAD ALL MODELS FIRST (CRITICAL FOR MONGOOSE)
========================================================= */
require('./models/Admin');
require('./models/AdminRole');
require('./models/AdminSession');
require('./models/AdminLog');
require('./models/AdminPermission');
require('./models/AdminSetting');
require('./models/Product');
require('./models/Category');

/* =========================================================
   Trust Proxy (for rate limiting behind reverse proxy)
========================================================= */
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/* =========================================================
   Redis Session Store
========================================================= */
let sessionStore;

if (redisClient && redisClient.isReady) {
  try {
    const connectRedis = require('connect-redis');
    let RedisStore;

    if (typeof connectRedis === 'function') {
      RedisStore = connectRedis(session);
    } else if (connectRedis?.default) {
      RedisStore = connectRedis.default(session);
    } else if (connectRedis?.RedisStore) {
      RedisStore = connectRedis.RedisStore(session);
    } else {
      throw new Error('Unable to initialize connect-redis');
    }

    sessionStore = new RedisStore({
      client: redisClient,
      prefix: 'sess:',
    });

    logger.info('✅ Redis session store initialized');
  } catch (error) {
    logger.error('Redis session error:', error.message);
    logger.warn('⚠️ Falling back to memory store');
    const MemoryStore = require('memorystore')(session);
    sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }
} else {
  logger.warn('⚠️ Redis not available, using memory session store');
  const MemoryStore = require('memorystore')(session);
  sessionStore = new MemoryStore({
    checkPeriod: 86400000,
  });
}

/* =========================================================
   Security & Global Middleware
========================================================= */

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));




// ✅ FIXED: Allow all localhost origins for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(securityHeaders);

/* =========================================================
   Session Middleware
========================================================= */
// ✅ FIXED: Changed sameSite from 'strict' to 'lax' for cross-origin requests
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'admin_session_id',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_EXPIRES_IN) || 3600000,
    sameSite: 'lax', // ✅ CHANGED FROM 'strict' TO 'lax'
  },
}));

/* =========================================================
   Rate Limiting
========================================================= */
app.use('/api', rateLimiter);

/* =========================================================
   Request Logging
========================================================= */
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
});

/* =========================================================
   Routes
========================================================= */
app.use('/api', routes);

/* =========================================================
   Health Check
========================================================= */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    redis: redisClient?.isReady ? 'connected' : 'disconnected',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

/* =========================================================
   404 Handler
========================================================= */
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`,
    error: 'Route not found',
  });
});

/* =========================================================
   Global Error Handler
========================================================= */
app.use(errorHandler);

module.exports = app;

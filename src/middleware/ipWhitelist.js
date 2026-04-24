const ipWhitelist = (req, res, next) => {
  if (process.env.IP_WHITELIST_ENABLED !== 'true') {
    return next();
  }
  
  const whitelist = process.env.IP_WHITELIST?.split(',') || [];
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // Remove IPv6 prefix if present
  const cleanIp = clientIp.replace('::ffff:', '');
  
  if (whitelist.includes(cleanIp) || whitelist.includes(clientIp)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Your IP is not whitelisted.',
    });
  }
};

module.exports = { ipWhitelist };
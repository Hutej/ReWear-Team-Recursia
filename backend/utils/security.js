const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Security constants
const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_SALT_ROUNDS: 12,
  TOKEN_LENGTH: 32,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

// Generate secure random token
const generateSecureToken = (length = SECURITY_CONFIG.TOKEN_LENGTH) => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash sensitive data
const hashData = async (data, saltRounds = SECURITY_CONFIG.PASSWORD_SALT_ROUNDS) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(data, salt);
  } catch (error) {
    console.error('Error hashing data:', error);
    throw new Error('Hashing failed');
  }
};

// Compare hashed data
const compareHashedData = async (plainData, hashedData) => {
  try {
    return await bcrypt.compare(plainData, hashedData);
  } catch (error) {
    console.error('Error comparing hashed data:', error);
    return false;
  }
};

// Validate password strength
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>\"']/g, function(match) {
      return {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      }[match];
    });
};

// Sanitize object recursively
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
};

// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate CSRF token
const validateCSRFToken = (token, sessionToken) => {
  if (!token || !sessionToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  );
};

// IP address validation
const isValidIP = (ip) => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// Extract real IP address
const extractRealIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip ||
         'unknown';
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add HSTS header in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// Suspicious activity detection
const detectSuspiciousActivity = (req) => {
  const suspiciousPatterns = [
    /(\<|\%3C).*script.*(\>|\%3E)/i,
    /(\<|\%3C).*iframe.*(\>|\%3E)/i,
    /(\<|\%3C).*object.*(\>|\%3E)/i,
    /(\<|\%3C).*embed.*(\>|\%3E)/i,
    /(\<|\%3C).*form.*(\>|\%3E)/i,
    /union.*select.*from/i,
    /select.*from.*where/i,
    /insert.*into.*values/i,
    /delete.*from.*where/i,
    /drop.*table/i,
    /exec.*xp_/i,
    /waitfor.*delay/i
  ];
  
  const userAgent = req.headers['user-agent'] || '';
  const requestBody = JSON.stringify(req.body || {});
  const queryString = req.url.split('?')[1] || '';
  
  const testString = `${userAgent} ${requestBody} ${queryString}`;
  
  return suspiciousPatterns.some(pattern => pattern.test(testString));
};

// Rate limiting store (in-memory - for production use Redis)
const rateLimitStore = new Map();

// Custom rate limiter
const customRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests',
    skipSuccessfulRequests = false
  } = options;
  
  return (req, res, next) => {
    const key = extractRealIP(req);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    const userRequests = rateLimitStore.get(key) || [];
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    
    // Clean up store periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [ip, requests] of rateLimitStore.entries()) {
        const validReqs = requests.filter(time => time > windowStart);
        if (validReqs.length === 0) {
          rateLimitStore.delete(ip);
        } else {
          rateLimitStore.set(ip, validReqs);
        }
      }
    }
    
    next();
  };
};

// Security audit logger
const securityAuditLog = (event, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity: details.severity || 'info'
  };
  
  // In production, this should write to a secure log file or service
  console.log('SECURITY_AUDIT:', JSON.stringify(logEntry));
};

// Input validation utilities
const validationUtils = {
  isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isUsername: (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username),
  isPhoneNumber: (phone) => /^\+?[\d\s\-\(\)]{10,}$/.test(phone),
  isURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  isSafeString: (str) => !/[<>\"'&]/.test(str),
  isPositiveInteger: (num) => Number.isInteger(num) && num > 0,
  isValidObjectId: (id) => /^[0-9a-fA-F]{24}$/.test(id)
};

module.exports = {
  SECURITY_CONFIG,
  generateSecureToken,
  hashData,
  compareHashedData,
  validatePassword,
  sanitizeInput,
  sanitizeObject,
  generateCSRFToken,
  validateCSRFToken,
  isValidIP,
  extractRealIP,
  securityHeaders,
  detectSuspiciousActivity,
  customRateLimit,
  securityAuditLog,
  validationUtils
}; 
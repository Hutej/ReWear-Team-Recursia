const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found with this token'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account has been deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token provided'
    });
  }
};

// Admin access middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    // Check if user has admin role
    if (roles.includes('admin') && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token, but populates user if token exists
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Don't fail for optional auth, just continue without user
      req.user = null;
    }
  }

  next();
};

// Check if user owns resource
const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${resourceModel}`);
      const resourceId = req.params[resourceIdParam];
      
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: `${resourceModel} not found`
        });
      }

      // Check if user owns the resource or is admin
      if (!resource.owner.equals(req.user._id) && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this resource'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This can be expanded with more sophisticated rate limiting
  // For now, it's a placeholder that can be enhanced
  next();
};

// Validate email verification
const requireEmailVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }
  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
  sensitiveOperationLimit,
  requireEmailVerification
}; 
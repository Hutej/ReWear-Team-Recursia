const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }
  
  next();
};

// User registration validation
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and cannot exceed 50 characters')
    .trim(),
  
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and cannot exceed 50 characters')
    .trim(),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Update profile validation
const validateProfileUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .trim(),
  
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .trim(),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
    .trim(),
  
  body('location.city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters')
    .trim(),
  
  body('location.state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters')
    .trim(),
  
  body('location.country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters')
    .trim(),
  
  body('location.zipCode')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Zip code cannot exceed 20 characters')
    .trim(),
  
  handleValidationErrors
];

// Item creation validation
const validateItemCreation = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and cannot exceed 100 characters')
    .trim(),
  
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  
  body('category')
    .isIn(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'activewear', 'sleepwear', 'formal', 'vintage', 'other'])
    .withMessage('Please select a valid category'),
  
  body('type')
    .isLength({ min: 1, max: 50 })
    .withMessage('Item type is required and cannot exceed 50 characters')
    .trim(),
  
  body('size')
    .isIn(['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', 'One Size'])
    .withMessage('Please select a valid size'),
  
  body('condition')
    .isIn(['new_with_tags', 'like_new', 'excellent', 'good', 'fair', 'poor'])
    .withMessage('Please select a valid condition'),
  
  body('brand')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Brand name cannot exceed 50 characters')
    .trim(),
  
  body('color')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Color cannot exceed 30 characters')
    .trim(),
  
  body('material')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Material cannot exceed 100 characters')
    .trim(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters')
    .trim(),
  
  handleValidationErrors
];

// Swap request validation
const validateSwapRequest = [
  body('type')
    .isIn(['item_swap', 'points_redemption'])
    .withMessage('Please select a valid swap type'),
  
  body('recipientItem')
    .if(body('type').equals('item_swap'))
    .isMongoId()
    .withMessage('Valid recipient item ID is required for item swap'),
  
  body('initiatorItem')
    .if(body('type').equals('item_swap'))
    .isMongoId()
    .withMessage('Valid initiator item ID is required for item swap'),
  
  body('requestedItem')
    .if(body('type').equals('points_redemption'))
    .isMongoId()
    .withMessage('Valid requested item ID is required for points redemption'),
  
  body('pointsOffered')
    .if(body('type').equals('points_redemption'))
    .isInt({ min: 1 })
    .withMessage('Points offered must be a positive integer'),
  
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
    .trim(),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Search and filter validation
const validateItemSearch = [
  query('search')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Search query cannot exceed 200 characters')
    .trim(),
  
  query('category')
    .optional()
    .isIn(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'activewear', 'sleepwear', 'formal', 'vintage', 'other'])
    .withMessage('Invalid category'),
  
  query('size')
    .optional()
    .isIn(['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', 'One Size'])
    .withMessage('Invalid size'),
  
  query('condition')
    .optional()
    .isIn(['new_with_tags', 'like_new', 'excellent', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
  
  query('minPoints')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum points must be a non-negative integer'),
  
  query('maxPoints')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum points must be a non-negative integer'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'pointsValue', 'views', 'title'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Email validation
const validateEmail = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validateItemCreation,
  validateSwapRequest,
  validatePagination,
  validateItemSearch,
  validateMongoId,
  validatePasswordChange,
  validateEmail
}; 
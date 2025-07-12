const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getItemsForModeration,
  moderateItem,
  deleteItem,
  awardPoints,
  getAnalytics,
  getRecentActivity,
  toggleItemFeature
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');
const {
  validatePagination,
  validateMongoId
} = require('../middleware/validation');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(authorize('admin'));

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/activity', getRecentActivity);

// User management
router.get('/users', [validatePagination], getUsers);
router.put('/users/:id/status', validateMongoId('id'), updateUserStatus);
router.post('/users/:id/points', validateMongoId('id'), awardPoints);

// Item moderation
router.get('/items', [validatePagination], getItemsForModeration);
router.put('/items/:id/moderate', validateMongoId('id'), moderateItem);
router.put('/items/:id/feature', validateMongoId('id'), toggleItemFeature);
router.delete('/items/:id', validateMongoId('id'), deleteItem);

module.exports = router; 
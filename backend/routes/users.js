const express = require('express');
const {
  getUsers,
  getUser,
  getUserItems,
  getUserSwaps,
  getUserPointsHistory,
  toggleFollow,
  getUserStats,
  updateProfilePhoto,
  searchUsers
} = require('../controllers/userController');

const { protect, optionalAuth, authorize } = require('../middleware/auth');
const {
  validatePagination,
  validateMongoId
} = require('../middleware/validation');
const { uploadProfilePhoto } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/search', searchUsers);
router.get('/', validatePagination, getUsers);
router.get('/:id', validateMongoId('id'), getUser);
router.get('/:id/items', [validateMongoId('id'), validatePagination], getUserItems);
router.get('/:id/stats', validateMongoId('id'), getUserStats);

// Protected routes
router.use(protect);

router.get('/:id/swaps', [validateMongoId('id'), validatePagination], getUserSwaps);
router.get('/:id/points', [validateMongoId('id'), validatePagination], getUserPointsHistory);
router.post('/:id/follow', validateMongoId('id'), toggleFollow);
router.put('/:id/photo', [validateMongoId('id'), uploadProfilePhoto.single('photo')], updateProfilePhoto);

module.exports = router; 
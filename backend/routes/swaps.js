const express = require('express');
const {
  getSwaps,
  getSwap,
  createSwapRequest,
  respondToSwap,
  completeSwap,
  cancelSwap,
  rateSwapParticipant,
  getUserSwaps,
  getSwapStats
} = require('../controllers/swapController');

const { protect, authorize } = require('../middleware/auth');
const {
  validateSwapRequest,
  validatePagination,
  validateMongoId
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User swap routes
router.get('/my-swaps', [validatePagination], getUserSwaps);
router.post('/', validateSwapRequest, createSwapRequest);

// Individual swap management
router.get('/:id', validateMongoId('id'), getSwap);
router.put('/:id/respond', validateMongoId('id'), respondToSwap);
router.put('/:id/complete', validateMongoId('id'), completeSwap);
router.put('/:id/cancel', validateMongoId('id'), cancelSwap);
router.post('/:id/rate', validateMongoId('id'), rateSwapParticipant);

// Admin only routes
router.get('/', [authorize('admin'), validatePagination], getSwaps);
router.get('/admin/stats', authorize('admin'), getSwapStats);

module.exports = router; 
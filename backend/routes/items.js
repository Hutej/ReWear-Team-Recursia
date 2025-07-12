const express = require('express');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  toggleFavorite,
  getFavoriteItems,
  reportItem,
  getItemCategories,
  getSimilarItems,
  uploadItemImages: uploadItemImagesController,
  getMyItems
} = require('../controllers/itemController');

const { protect, optionalAuth } = require('../middleware/auth');
const {
  validateItemCreation,
  validatePagination,
  validateItemSearch,
  validateMongoId
} = require('../middleware/validation');
const { uploadItemImages } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/categories', getItemCategories);
router.get('/', [validatePagination, validateItemSearch], getItems);
router.get('/:id', [validateMongoId('id'), optionalAuth], getItem);
router.get('/:id/similar', validateMongoId('id'), getSimilarItems);

// Protected routes
router.use(protect);

// User-specific routes
router.get('/my/items', [validatePagination], getMyItems);
router.get('/my/favorites', [validatePagination], getFavoriteItems);

// Item management
router.post('/', validateItemCreation, createItem);
router.put('/:id', [validateMongoId('id'), validateItemCreation], updateItem);
router.delete('/:id', validateMongoId('id'), deleteItem);

// Item interactions
router.post('/:id/favorite', validateMongoId('id'), toggleFavorite);
router.post('/:id/report', validateMongoId('id'), reportItem);
router.post('/:id/images', [validateMongoId('id'), uploadItemImages.array('images', 5)], uploadItemImagesController);

module.exports = router; 
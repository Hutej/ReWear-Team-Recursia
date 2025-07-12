const Item = require('../models/Item');
const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');

// @desc    Get all items with search and filtering
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'available' };

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Filters
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.size) {
      query.size = req.query.size;
    }

    if (req.query.condition) {
      query.condition = req.query.condition;
    }

    if (req.query.minPoints || req.query.maxPoints) {
      query.pointsValue = {};
      if (req.query.minPoints) {
        query.pointsValue.$gte = parseInt(req.query.minPoints);
      }
      if (req.query.maxPoints) {
        query.pointsValue.$lte = parseInt(req.query.maxPoints);
      }
    }

    if (req.query.location) {
      // This would require adding location data to items or joining with users
      // For now, we'll search by owner location
      const usersInLocation = await User.find({
        $or: [
          { 'location.city': { $regex: req.query.location, $options: 'i' } },
          { 'location.state': { $regex: req.query.location, $options: 'i' } },
          { 'location.country': { $regex: req.query.location, $options: 'i' } }
        ]
      }).select('_id');
      
      query.owner = { $in: usersInLocation.map(user => user._id) };
    }

    // Sorting
    let sortOption = {};
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    sortOption[sortBy] = sortOrder;

    // Featured items first if no specific sort
    if (!req.query.sortBy) {
      sortOption = { featured: -1, createdAt: -1 };
    }

    const items = await Item.find(query)
      .populate('owner', 'username firstName lastName profilePhoto location')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Item.countDocuments(query);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'username firstName lastName profilePhoto location')
      .populate('favorites', 'username firstName lastName');

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Increment view count (if user is not the owner)
    if (!req.user || !item.owner._id.equals(req.user.id)) {
      await item.incrementViews();
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.owner = req.user.id;

    const item = await Item.create(req.body);

    // Award points for creating an item
    const pointsReward = parseInt(process.env.ITEM_UPLOAD_POINTS_REWARD) || 5;
    if (pointsReward > 0) {
      await PointsTransaction.createTransaction({
        user: req.user.id,
        type: 'earned',
        amount: pointsReward,
        reason: 'Item upload reward',
        description: `Points earned for uploading item: ${item.title}`,
        reference: {
          model: 'Item',
          id: item._id
        },
        metadata: {
          source: 'system',
          itemId: item._id
        }
      });
    }

    const populatedItem = await Item.findById(item._id)
      .populate('owner', 'username firstName lastName profilePhoto');

    res.status(201).json({
      success: true,
      data: populatedItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (owner or admin)
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Check ownership
    if (!item.owner.equals(req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this item'
      });
    }

    // Don't allow status changes via this endpoint (use approve/reject endpoints)
    delete req.body.status;
    delete req.body.owner;

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('owner', 'username firstName lastName profilePhoto');

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (owner or admin)
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Check ownership
    if (!item.owner.equals(req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this item'
      });
    }

    // Check if item is involved in any active swaps
    const Swap = require('../models/Swap');
    const activeSwaps = await Swap.find({
      $or: [
        { initiatorItem: item._id },
        { recipientItem: item._id },
        { requestedItem: item._id }
      ],
      status: { $in: ['pending', 'accepted'] }
    });

    if (activeSwaps.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete item with active swap requests'
      });
    }

    // TODO: Delete associated images from Cloudinary

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/Remove item from favorites
// @route   POST /api/items/:id/favorite
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const isFavorited = item.favorites.includes(req.user.id);

    if (isFavorited) {
      await item.removeFromFavorites(req.user.id);
    } else {
      await item.addToFavorites(req.user.id);
    }

    res.status(200).json({
      success: true,
      favorited: !isFavorited,
      favoritesCount: item.favorites.length + (isFavorited ? -1 : 1)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorite items
// @route   GET /api/items/favorites
// @access  Private
const getFavoriteItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const items = await Item.find({
      favorites: req.user.id,
      status: 'available'
    })
      .populate('owner', 'username firstName lastName profilePhoto location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Item.countDocuments({
      favorites: req.user.id,
      status: 'available'
    });

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report item
// @route   POST /api/items/:id/report
// @access  Private
const reportItem = async (req, res, next) => {
  try {
    const { reason, description } = req.body;
    
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Check if user already reported this item
    const existingReport = item.reports.find(report => 
      report.user.equals(req.user.id)
    );

    if (existingReport) {
      return res.status(400).json({
        success: false,
        error: 'You have already reported this item'
      });
    }

    item.reports.push({
      user: req.user.id,
      reason,
      description
    });

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item reported successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get item categories and their counts
// @route   GET /api/items/categories
// @access  Public
const getItemCategories = async (req, res, next) => {
  try {
    const categories = await Item.getCategoryStats();

    const categoriesWithDisplay = categories.map(cat => ({
      value: cat._id,
      display: cat._id.charAt(0).toUpperCase() + cat._id.slice(1).replace('_', ' '),
      count: cat.count,
      avgPoints: Math.round(cat.avgPoints || 0)
    }));

    res.status(200).json({
      success: true,
      data: categoriesWithDisplay
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar items
// @route   GET /api/items/:id/similar
// @access  Public
const getSimilarItems = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const limit = parseInt(req.query.limit, 10) || 8;

    const similarItems = await Item.find({
      _id: { $ne: item._id },
      status: 'available',
      $or: [
        { category: item.category },
        { size: item.size },
        { brand: item.brand },
        { tags: { $in: item.tags } }
      ]
    })
      .populate('owner', 'username firstName lastName profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: similarItems.length,
      data: similarItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload item images
// @route   POST /api/items/:id/images
// @access  Private (owner)
const uploadItemImages = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Check ownership
    if (!item.owner.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to upload images for this item'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images provided'
      });
    }

    // Import Cloudinary functions
    const { processItemImages, deleteMultipleImages } = require('../config/cloudinary');

    try {
      // Upload new images to Cloudinary
      const uploadedImages = await processItemImages(req.files, req.user.id);

      // Delete old images if they exist
      if (item.images && item.images.length > 0) {
        const oldPublicIds = item.images.map(img => img.public_id).filter(Boolean);
        if (oldPublicIds.length > 0) {
          await deleteMultipleImages(oldPublicIds);
        }
      }

      // Update item with new images
      item.images = uploadedImages;
      await item.save();

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          images: uploadedImages
        }
      });
    } catch (uploadError) {
      console.error('Error uploading images:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload images. Please try again.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get my items
// @route   GET /api/items/my-items
// @access  Private
const getMyItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let query = { owner: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Item.countDocuments(query);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: items
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  uploadItemImages,
  getMyItems
}; 
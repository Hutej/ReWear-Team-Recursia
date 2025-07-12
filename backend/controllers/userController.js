const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const PointsTransaction = require('../models/PointsTransaction');

// @desc    Get all users with pagination and search
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const location = req.query.location || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    let query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Execute query
    const users = await User.find(query)
      .select('-password -email -emailVerificationToken -passwordResetToken')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('itemsCount')
      .populate('swapsCount');

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user profile
// @route   GET /api/users/:id
// @access  Public
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -emailVerificationToken -passwordResetToken')
      .populate('itemsCount')
      .populate('swapsCount');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        error: 'User account is not active'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's items
// @route   GET /api/users/:id/items
// @access  Public
const getUserItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'available';

    const user = await User.findById(req.params.id).select('_id isActive');
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const query = { 
      owner: req.params.id,
      status: status === 'all' ? { $ne: 'rejected' } : status
    };

    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'username firstName lastName profilePhoto');

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

// @desc    Get user's swap history
// @route   GET /api/users/:id/swaps
// @access  Private (own swaps) / Admin
const getUserSwaps = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Check if user is viewing their own swaps or is admin
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this user\'s swaps'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let query = {
      $or: [
        { initiator: userId },
        { recipient: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const swaps = await Swap.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('initiator', 'username firstName lastName profilePhoto')
      .populate('recipient', 'username firstName lastName profilePhoto')
      .populate('initiatorItem', 'title images category size condition')
      .populate('recipientItem', 'title images category size condition')
      .populate('requestedItem', 'title images category size condition');

    const total = await Swap.countDocuments(query);

    res.status(200).json({
      success: true,
      count: swaps.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: swaps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's points transaction history
// @route   GET /api/users/:id/points
// @access  Private (own transactions) / Admin
const getUserPointsHistory = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Check if user is viewing their own transactions or is admin
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this user\'s points history'
      });
    }

    const options = {
      limit: parseInt(req.query.limit, 10) || 50,
      skip: ((parseInt(req.query.page, 10) || 1) - 1) * (parseInt(req.query.limit, 10) || 50),
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const transactions = await PointsTransaction.getUserHistory(userId, options);
    const stats = await PointsTransaction.getPointsStats(userId);

    res.status(200).json({
      success: true,
      data: transactions,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollow = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      });
    }

    // This would require adding following/followers fields to User model
    // For now, return a placeholder response
    res.status(200).json({
      success: true,
      message: 'Follow feature - coming soon'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('_id isActive createdAt');
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get various statistics
    const [itemStats, swapStats, pointsStats] = await Promise.all([
      Item.aggregate([
        { $match: { owner: user._id } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            availableItems: {
              $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
            },
            swappedItems: {
              $sum: { $cond: [{ $eq: ['$status', 'swapped'] }, 1, 0] }
            },
            totalViews: { $sum: '$views' },
            avgPointsValue: { $avg: '$pointsValue' }
          }
        }
      ]),
      
      Swap.aggregate([
        {
          $match: {
            $or: [{ initiator: user._id }, { recipient: user._id }]
          }
        },
        {
          $group: {
            _id: null,
            totalSwaps: { $sum: 1 },
            completedSwaps: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            pendingSwaps: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            }
          }
        }
      ]),
      
      PointsTransaction.getPointsStats(userId)
    ]);

    const stats = {
      memberSince: user.createdAt,
      items: itemStats[0] || {
        totalItems: 0,
        availableItems: 0,
        swappedItems: 0,
        totalViews: 0,
        avgPointsValue: 0
      },
      swaps: swapStats[0] || {
        totalSwaps: 0,
        completedSwaps: 0,
        pendingSwaps: 0
      },
      points: pointsStats
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile photo
// @route   PUT /api/users/:id/photo
// @access  Private (own profile) / Admin
const updateProfilePhoto = async (req, res, next) => {
  try {
    // Check if user is updating their own profile or is admin
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this profile'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image provided'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Import Cloudinary functions
    const { uploadProfileImage, deleteImage } = require('../config/cloudinary');

    try {
      // Upload new profile photo to Cloudinary
      const uploadedImage = await uploadProfileImage(req.file.buffer, req.params.id);

      // Delete old profile photo if it exists
      if (user.profilePhoto && user.profilePhoto.public_id) {
        await deleteImage(user.profilePhoto.public_id);
      }

      // Update user with new profile photo
      user.profilePhoto = uploadedImage;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile photo updated successfully',
        data: {
          profilePhoto: uploadedImage
        }
      });
    } catch (uploadError) {
      console.error('Error uploading profile photo:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload profile photo. Please try again.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res, next) => {
  try {
    const { q, location, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    let query = {
      isActive: true,
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    };

    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('username firstName lastName profilePhoto location')
      .limit(parseInt(limit))
      .sort({ username: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  getUserItems,
  getUserSwaps,
  getUserPointsHistory,
  toggleFollow,
  getUserStats,
  updateProfilePhoto,
  searchUsers
}; 
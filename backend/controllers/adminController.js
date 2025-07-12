const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const PointsTransaction = require('../models/PointsTransaction');

// @desc    Get platform dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res, next) => {
  try {
    const [userStats, itemStats, swapStats] = await Promise.all([
      User.getUserStats(),
      Item.getItemStats(),
      Swap.getSwapStats()
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [recentUsers, recentItems, recentSwaps] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Item.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Swap.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);

    // Get items pending approval
    const pendingItems = await Item.countDocuments({ status: 'pending_approval' });

    // Get reported items
    const reportedItems = await Item.countDocuments({ 'reports.0': { $exists: true } });

    const dashboardData = {
      users: {
        ...userStats,
        recentSignups: recentUsers
      },
      items: {
        ...itemStats,
        recentUploads: recentItems,
        pendingApproval: pendingItems,
        reported: reportedItems
      },
      swaps: {
        ...swapStats,
        recentSwaps: recentSwaps
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin management
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status; // active, inactive
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const users = await User.find(query)
      .select('-password -passwordResetToken')
      .populate('itemsCount')
      .populate('swapsCount')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

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

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, reason } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive must be a boolean value'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admins from deactivating themselves
    if (req.user.id === req.params.id && !isActive) {
      return res.status(400).json({
        success: false,
        error: 'You cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    // Log the action
    console.log(`Admin ${req.user.username} ${isActive ? 'activated' : 'deactivated'} user ${user.username}. Reason: ${reason || 'No reason provided'}`);

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        userId: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get items for moderation
// @route   GET /api/admin/items
// @access  Private (Admin only)
const getItemsForModeration = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'pending_approval';
    const category = req.query.category;
    const reported = req.query.reported === 'true';

    let query = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (reported) {
      query['reports.0'] = { $exists: true };
    }

    const items = await Item.find(query)
      .populate('owner', 'username firstName lastName email profilePhoto')
      .populate('moderatedBy', 'username firstName lastName')
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

// @desc    Moderate item (approve/reject)
// @route   PUT /api/admin/items/:id/moderate
// @access  Private (Admin only)
const moderateItem = async (req, res, next) => {
  try {
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Action must be either "approve" or "reject"'
      });
    }

    const item = await Item.findById(req.params.id).populate('owner', 'username email');

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const newStatus = action === 'approve' ? 'available' : 'rejected';
    
    item.status = newStatus;
    item.moderatedBy = req.user.id;
    item.moderatedAt = new Date();
    
    if (reason) {
      item.moderationNotes = reason;
    }

    await item.save();

    // If approving, award points to the user
    if (action === 'approve') {
      const pointsReward = parseInt(process.env.ITEM_UPLOAD_POINTS_REWARD) || 5;
      if (pointsReward > 0) {
        await PointsTransaction.createTransaction({
          user: item.owner._id,
          type: 'earned',
          amount: pointsReward,
          reason: 'Item approved by admin',
          description: `Points earned for approved item: ${item.title}`,
          reference: {
            model: 'Item',
            id: item._id
          },
          metadata: {
            source: 'admin',
            adminId: req.user.id,
            itemId: item._id
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Item ${action}ed successfully`,
      data: {
        itemId: item._id,
        title: item.title,
        status: item.status,
        moderatedBy: req.user.username,
        moderatedAt: item.moderatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item (admin)
// @route   DELETE /api/admin/items/:id
// @access  Private (Admin only)
const deleteItem = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    // Check for active swaps
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
    if (item.images && item.images.length > 0) {
      const { deleteMultipleImages } = require('../config/cloudinary');
      const publicIds = item.images.map(img => img.public_id).filter(Boolean);
      if (publicIds.length > 0) {
        try {
          await deleteMultipleImages(publicIds);
        } catch (error) {
          console.error('Error deleting images from Cloudinary:', error);
        }
      }
    }

    await item.deleteOne();

    // Log the deletion
    console.log(`Admin ${req.user.username} deleted item ${item.title} (ID: ${item._id}). Reason: ${reason || 'No reason provided'}`);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Award points to user
// @route   POST /api/admin/users/:id/points
// @access  Private (Admin only)
const awardPoints = async (req, res, next) => {
  try {
    const { amount, reason, description } = req.body;

    if (!amount || isNaN(amount) || amount === 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid point amount is required'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Reason is required'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const transactionType = amount > 0 ? 'awarded' : 'deducted';

    await PointsTransaction.createTransaction({
      user: user._id,
      type: transactionType,
      amount: amount,
      reason: reason,
      description: description || `Points ${transactionType} by admin`,
      metadata: {
        source: 'admin',
        adminId: req.user.id
      }
    });

    // Get updated user with new points balance
    const updatedUser = await User.findById(user._id);

    res.status(200).json({
      success: true,
      message: `${Math.abs(amount)} points ${amount > 0 ? 'awarded to' : 'deducted from'} ${user.username}`,
      data: {
        userId: user._id,
        username: user.username,
        previousPoints: user.points,
        newPoints: updatedUser.points,
        change: amount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // User growth analytics
    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Item upload analytics
    const itemUploads = await Item.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Swap activity analytics
    const swapActivity = await Swap.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Category distribution
    const categoryStats = await Item.getCategoryStats();

    // Most active users
    const activeUsers = await User.aggregate([
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'owner',
          as: 'items'
        }
      },
      {
        $lookup: {
          from: 'swaps',
          localField: '_id',
          foreignField: 'initiator',
          as: 'initiatedSwaps'
        }
      },
      {
        $addFields: {
          totalActivity: {
            $add: [
              { $size: '$items' },
              { $size: '$initiatedSwaps' }
            ]
          }
        }
      },
      {
        $match: { totalActivity: { $gt: 0 } }
      },
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          itemsCount: { $size: '$items' },
          swapsCount: { $size: '$initiatedSwaps' },
          totalActivity: 1
        }
      },
      { $sort: { totalActivity: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: `${days} days`,
        userGrowth,
        itemUploads,
        swapActivity,
        categoryStats,
        activeUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent platform activity
// @route   GET /api/admin/activity
// @access  Private (Admin only)
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    // Get recent user registrations
    const recentUsers = await User.find({ isActive: true })
      .select('username firstName lastName createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent item uploads
    const recentItems = await Item.find({ status: { $ne: 'rejected' } })
      .populate('owner', 'username firstName lastName')
      .select('title category createdAt owner')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent swaps
    const recentSwaps = await Swap.find({})
      .populate('initiator', 'username firstName lastName')
      .populate('recipient', 'username firstName lastName')
      .select('type status initiator recipient createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent points transactions
    const recentTransactions = await PointsTransaction.find({})
      .populate('user', 'username firstName lastName')
      .select('user type amount reason createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        recentUsers,
        recentItems,
        recentSwaps,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Feature/unfeature item
// @route   PUT /api/admin/items/:id/feature
// @access  Private (Admin only)
const toggleItemFeature = async (req, res, next) => {
  try {
    const { featured, featuredUntil } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    item.featured = featured;
    
    if (featured && featuredUntil) {
      item.featuredUntil = new Date(featuredUntil);
    } else if (!featured) {
      item.featuredUntil = undefined;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: `Item ${featured ? 'featured' : 'unfeatured'} successfully`,
      data: {
        itemId: item._id,
        title: item.title,
        featured: item.featured,
        featuredUntil: item.featuredUntil
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
}; 
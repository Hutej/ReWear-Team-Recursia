const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');

// @desc    Get all swaps with filtering and pagination
// @route   GET /api/swaps
// @access  Private (Admin only)
const getSwaps = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.user) {
      query.$or = [
        { initiator: req.query.user },
        { recipient: req.query.user }
      ];
    }

    const swaps = await Swap.find(query)
      .populate('initiator', 'username firstName lastName profilePhoto')
      .populate('recipient', 'username firstName lastName profilePhoto')
      .populate('initiatorItem', 'title images category size condition pointsValue')
      .populate('recipientItem', 'title images category size condition pointsValue')
      .populate('requestedItem', 'title images category size condition pointsValue')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// @desc    Get single swap
// @route   GET /api/swaps/:id
// @access  Private (participants or admin)
const getSwap = async (req, res, next) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('initiator', 'username firstName lastName profilePhoto location')
      .populate('recipient', 'username firstName lastName profilePhoto location')
      .populate('initiatorItem', 'title description images category size condition pointsValue')
      .populate('recipientItem', 'title description images category size condition pointsValue')
      .populate('requestedItem', 'title description images category size condition pointsValue');

    if (!swap) {
      return res.status(404).json({
        success: false,
        error: 'Swap not found'
      });
    }

    // Check if user is participant or admin
    const isParticipant = swap.initiator._id.equals(req.user.id) || swap.recipient._id.equals(req.user.id);
    
    if (!isParticipant && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this swap'
      });
    }

    res.status(200).json({
      success: true,
      data: swap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create swap request
// @route   POST /api/swaps
// @access  Private
const createSwapRequest = async (req, res, next) => {
  try {
    const { type, recipientItem, initiatorItem, requestedItem, pointsOffered, message } = req.body;

    // Validate swap type and required fields
    if (type === 'item_swap') {
      if (!recipientItem || !initiatorItem) {
        return res.status(400).json({
          success: false,
          error: 'Both initiator and recipient items are required for item swap'
        });
      }
    } else if (type === 'points_redemption') {
      if (!requestedItem || !pointsOffered) {
        return res.status(400).json({
          success: false,
          error: 'Requested item and points offered are required for points redemption'
        });
      }
    }

    // Validate items exist and are available
    let itemToRequest, itemToOffer, recipient;

    if (type === 'item_swap') {
      [itemToOffer, itemToRequest] = await Promise.all([
        Item.findById(initiatorItem),
        Item.findById(recipientItem)
      ]);

      if (!itemToOffer || !itemToRequest) {
        return res.status(404).json({
          success: false,
          error: 'One or both items not found'
        });
      }

      // Check ownership and availability
      if (!itemToOffer.owner.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          error: 'You can only offer items you own'
        });
      }

      if (itemToRequest.owner.equals(req.user.id)) {
        return res.status(400).json({
          success: false,
          error: 'You cannot request your own item'
        });
      }

      if (itemToOffer.status !== 'available' || itemToRequest.status !== 'available') {
        return res.status(400).json({
          success: false,
          error: 'Both items must be available for swap'
        });
      }

      recipient = itemToRequest.owner;
    } else {
      // Points redemption
      itemToRequest = await Item.findById(requestedItem);

      if (!itemToRequest) {
        return res.status(404).json({
          success: false,
          error: 'Requested item not found'
        });
      }

      if (itemToRequest.owner.equals(req.user.id)) {
        return res.status(400).json({
          success: false,
          error: 'You cannot redeem your own item'
        });
      }

      if (itemToRequest.status !== 'available') {
        return res.status(400).json({
          success: false,
          error: 'Item is not available for redemption'
        });
      }

      // Check if user has enough points
      const user = await User.findById(req.user.id);
      if (user.points < pointsOffered) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient points for this redemption'
        });
      }

      recipient = itemToRequest.owner;
    }

    // Check for existing pending swaps involving the same items
    const existingSwap = await Swap.findOne({
      $or: [
        {
          $and: [
            { initiator: req.user.id },
            { status: 'pending' },
            { $or: [
              { recipientItem: recipientItem },
              { requestedItem: requestedItem }
            ]}
          ]
        },
        {
          $and: [
            { recipient: req.user.id },
            { status: 'pending' },
            { $or: [
              { initiatorItem: initiatorItem },
              { requestedItem: requestedItem }
            ]}
          ]
        }
      ]
    });

    if (existingSwap) {
      return res.status(400).json({
        success: false,
        error: 'A pending swap already exists for this item'
      });
    }

    // Create swap request
    const swapData = {
      type,
      initiator: req.user.id,
      recipient: recipient._id,
      message
    };

    if (type === 'item_swap') {
      swapData.initiatorItem = initiatorItem;
      swapData.recipientItem = recipientItem;
    } else {
      swapData.requestedItem = requestedItem;
      swapData.pointsOffered = pointsOffered;
    }

    const swap = await Swap.create(swapData);

    // Update item status to 'requested'
    if (type === 'item_swap') {
      await Promise.all([
        Item.findByIdAndUpdate(initiatorItem, { status: 'requested' }),
        Item.findByIdAndUpdate(recipientItem, { status: 'requested' })
      ]);
    } else {
      await Item.findByIdAndUpdate(requestedItem, { status: 'requested' });
    }

    const populatedSwap = await Swap.findById(swap._id)
      .populate('initiator', 'username firstName lastName profilePhoto')
      .populate('recipient', 'username firstName lastName profilePhoto')
      .populate('initiatorItem', 'title images category size condition')
      .populate('recipientItem', 'title images category size condition')
      .populate('requestedItem', 'title images category size condition');

    res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      data: populatedSwap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to swap request (accept/reject)
// @route   PUT /api/swaps/:id/respond
// @access  Private (recipient only)
const respondToSwap = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Action must be either "accept" or "reject"'
      });
    }

    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        error: 'Swap request not found'
      });
    }

    // Check if user is the recipient
    if (!swap.recipient.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Only the recipient can respond to this swap request'
      });
    }

    // Check if swap is still pending
    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'This swap request has already been responded to'
      });
    }

    if (action === 'accept') {
      await swap.accept();
    } else {
      await swap.reject(rejectionReason);
      
      // Set items back to available
      if (swap.type === 'item_swap') {
        await Promise.all([
          Item.findByIdAndUpdate(swap.initiatorItem, { status: 'available' }),
          Item.findByIdAndUpdate(swap.recipientItem, { status: 'available' })
        ]);
      } else {
        await Item.findByIdAndUpdate(swap.requestedItem, { status: 'available' });
      }
    }

    const updatedSwap = await Swap.findById(swap._id)
      .populate('initiator', 'username firstName lastName profilePhoto')
      .populate('recipient', 'username firstName lastName profilePhoto')
      .populate('initiatorItem', 'title images category size condition')
      .populate('recipientItem', 'title images category size condition')
      .populate('requestedItem', 'title images category size condition');

    res.status(200).json({
      success: true,
      message: `Swap request ${action}ed successfully`,
      data: updatedSwap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete swap
// @route   PUT /api/swaps/:id/complete
// @access  Private (participants only)
const completeSwap = async (req, res, next) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        error: 'Swap not found'
      });
    }

    // Check if user is a participant
    const isParticipant = swap.initiator.equals(req.user.id) || swap.recipient.equals(req.user.id);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Only swap participants can complete the swap'
      });
    }

    // Check if swap is accepted
    if (swap.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        error: 'Swap must be accepted before it can be completed'
      });
    }

    await swap.complete();

    const updatedSwap = await Swap.findById(swap._id)
      .populate('initiator', 'username firstName lastName profilePhoto')
      .populate('recipient', 'username firstName lastName profilePhoto')
      .populate('initiatorItem', 'title images category size condition')
      .populate('recipientItem', 'title images category size condition')
      .populate('requestedItem', 'title images category size condition');

    res.status(200).json({
      success: true,
      message: 'Swap completed successfully',
      data: updatedSwap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel swap
// @route   PUT /api/swaps/:id/cancel
// @access  Private (initiator only or admin)
const cancelSwap = async (req, res, next) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        error: 'Swap not found'
      });
    }

    // Check if user is the initiator or admin
    if (!swap.initiator.equals(req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only the swap initiator or admin can cancel this swap'
      });
    }

    // Check if swap can be cancelled
    if (!['pending', 'accepted'].includes(swap.status)) {
      return res.status(400).json({
        success: false,
        error: 'This swap cannot be cancelled'
      });
    }

    await swap.cancel();

    // Set items back to available
    if (swap.type === 'item_swap') {
      await Promise.all([
        Item.findByIdAndUpdate(swap.initiatorItem, { status: 'available' }),
        Item.findByIdAndUpdate(swap.recipientItem, { status: 'available' })
      ]);
    } else {
      await Item.findByIdAndUpdate(swap.requestedItem, { status: 'available' });
    }

    const updatedSwap = await Swap.findById(swap._id)
      .populate('initiator', 'username firstName lastName profilePhoto')
      .populate('recipient', 'username firstName lastName profilePhoto')
      .populate('initiatorItem', 'title images category size condition')
      .populate('recipientItem', 'title images category size condition')
      .populate('requestedItem', 'title images category size condition');

    res.status(200).json({
      success: true,
      message: 'Swap cancelled successfully',
      data: updatedSwap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate swap participant
// @route   POST /api/swaps/:id/rate
// @access  Private (participants only)
const rateSwapParticipant = async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        error: 'Swap not found'
      });
    }

    // Check if user is a participant
    const isParticipant = swap.initiator.equals(req.user.id) || swap.recipient.equals(req.user.id);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Only swap participants can rate each other'
      });
    }

    // Check if swap is completed
    if (swap.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only rate completed swaps'
      });
    }

    await swap.addRating(req.user.id, rating, review);

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's swaps
// @route   GET /api/swaps/my-swaps
// @access  Private
const getUserSwaps = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const type = req.query.type;

    let query = {
      $or: [
        { initiator: req.user.id },
        { recipient: req.user.id }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const swaps = await Swap.find(query)
      .populate('initiator', 'username firstName lastName profilePhoto')
      .populate('recipient', 'username firstName lastName profilePhoto')
      .populate('initiatorItem', 'title images category size condition pointsValue')
      .populate('recipientItem', 'title images category size condition pointsValue')
      .populate('requestedItem', 'title images category size condition pointsValue')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// @desc    Get swap statistics
// @route   GET /api/swaps/stats
// @access  Private (Admin only)
const getSwapStats = async (req, res, next) => {
  try {
    const stats = await Swap.getSwapStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSwaps,
  getSwap,
  createSwapRequest,
  respondToSwap,
  completeSwap,
  cancelSwap,
  rateSwapParticipant,
  getUserSwaps,
  getSwapStats
}; 
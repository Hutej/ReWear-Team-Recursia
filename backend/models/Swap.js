const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: {
      values: ['item_swap', 'points_redemption'],
      message: 'Please select a valid swap type'
    },
    required: [true, 'Swap type is required']
  },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Swap initiator is required']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Swap recipient is required']
  },
  initiatorItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: function() {
      return this.type === 'item_swap';
    }
  },
  recipientItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: function() {
      return this.type === 'item_swap';
    }
  },
  requestedItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: function() {
      return this.type === 'points_redemption';
    }
  },
  pointsOffered: {
    type: Number,
    min: [1, 'Points offered must be at least 1'],
    required: function() {
      return this.type === 'points_redemption';
    }
  },
  status: {
    type: String,
    enum: {
      values: [
        'pending',
        'accepted',
        'rejected',
        'completed',
        'cancelled',
        'expired'
      ],
      message: 'Please select a valid status'
    },
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [300, 'Rejection reason cannot exceed 300 characters']
  },
  meetupDetails: {
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    date: Date,
    time: String,
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters']
    }
  },
  shippingDetails: {
    method: {
      type: String,
      enum: ['pickup', 'shipping', 'meetup']
    },
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    shippingCost: Number,
    notes: String
  },
  timeline: {
    requestedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: Date,
    completedAt: Date,
    cancelledAt: Date
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
  },
  ratings: {
    initiatorRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: {
        type: String,
        maxlength: [300, 'Review cannot exceed 300 characters']
      },
      ratedAt: Date
    },
    recipientRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: {
        type: String,
        maxlength: [300, 'Review cannot exceed 300 characters']
      },
      ratedAt: Date
    }
  },
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    reason: String,
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolution: String
  },
  notifications: {
    initiatorNotified: {
      type: Boolean,
      default: false
    },
    recipientNotified: {
      type: Boolean,
      default: false
    },
    remindersSent: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for participants array
swapSchema.virtual('participants').get(function() {
  return [this.initiator, this.recipient];
});

// Virtual for items involved
swapSchema.virtual('items').get(function() {
  if (this.type === 'item_swap') {
    return [this.initiatorItem, this.recipientItem];
  } else {
    return [this.requestedItem];
  }
});

// Virtual for swap duration
swapSchema.virtual('duration').get(function() {
  if (this.timeline.completedAt && this.timeline.requestedAt) {
    return this.timeline.completedAt - this.timeline.requestedAt;
  }
  return null;
});

// Virtual to check if swap is expired
swapSchema.virtual('isExpired').get(function() {
  return this.status === 'pending' && new Date() > this.expiresAt;
});

// Index for efficient queries
swapSchema.index({ initiator: 1, status: 1 });
swapSchema.index({ recipient: 1, status: 1 });
swapSchema.index({ status: 1, createdAt: -1 });
swapSchema.index({ expiresAt: 1 });
swapSchema.index({ 'timeline.requestedAt': -1 });

// Pre-save middleware to handle status changes
swapSchema.pre('save', function(next) {
  const now = new Date();
  
  // Set timeline dates based on status changes
  if (this.isModified('status')) {
    switch (this.status) {
      case 'accepted':
      case 'rejected':
        if (!this.timeline.respondedAt) {
          this.timeline.respondedAt = now;
        }
        break;
      case 'completed':
        if (!this.timeline.completedAt) {
          this.timeline.completedAt = now;
        }
        break;
      case 'cancelled':
        if (!this.timeline.cancelledAt) {
          this.timeline.cancelledAt = now;
        }
        break;
    }
  }
  
  next();
});

// Static method to get swap statistics
swapSchema.statics.getSwapStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSwaps: { $sum: 1 },
        completedSwaps: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        pendingSwaps: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        },
        itemSwaps: {
          $sum: {
            $cond: [{ $eq: ['$type', 'item_swap'] }, 1, 0]
          }
        },
        pointsRedemptions: {
          $sum: {
            $cond: [{ $eq: ['$type', 'points_redemption'] }, 1, 0]
          }
        },
        avgCompletionTime: {
          $avg: {
            $subtract: ['$timeline.completedAt', '$timeline.requestedAt']
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalSwaps: 0,
    completedSwaps: 0,
    pendingSwaps: 0,
    itemSwaps: 0,
    pointsRedemptions: 0,
    avgCompletionTime: 0
  };
};

// Static method to find expired swaps
swapSchema.statics.findExpiredSwaps = function() {
  return this.find({
    status: 'pending',
    expiresAt: { $lt: new Date() }
  });
};

// Instance method to accept swap
swapSchema.methods.accept = async function(meetupDetails = null, shippingDetails = null) {
  this.status = 'accepted';
  this.timeline.respondedAt = new Date();
  
  if (meetupDetails) {
    this.meetupDetails = meetupDetails;
  }
  
  if (shippingDetails) {
    this.shippingDetails = shippingDetails;
  }
  
  return await this.save();
};

// Instance method to reject swap
swapSchema.methods.reject = async function(reason = null) {
  this.status = 'rejected';
  this.timeline.respondedAt = new Date();
  
  if (reason) {
    this.rejectionReason = reason;
  }
  
  return await this.save();
};

// Instance method to complete swap
swapSchema.methods.complete = async function() {
  this.status = 'completed';
  this.timeline.completedAt = new Date();
  
  // Handle points transaction for points redemption
  if (this.type === 'points_redemption') {
    const User = mongoose.model('User');
    
    // Deduct points from initiator
    await User.findByIdAndUpdate(
      this.initiator,
      { $inc: { points: -this.pointsOffered } }
    );
    
    // Add points to recipient
    await User.findByIdAndUpdate(
      this.recipient,
      { $inc: { points: this.pointsOffered } }
    );
  }
  
  // Update item status
  const Item = mongoose.model('Item');
  
  if (this.type === 'item_swap') {
    await Item.findByIdAndUpdate(this.initiatorItem, { status: 'swapped' });
    await Item.findByIdAndUpdate(this.recipientItem, { status: 'swapped' });
  } else {
    await Item.findByIdAndUpdate(this.requestedItem, { status: 'swapped' });
  }
  
  return await this.save();
};

// Instance method to cancel swap
swapSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  this.timeline.cancelledAt = new Date();
  
  return await this.save();
};

// Instance method to add rating
swapSchema.methods.addRating = async function(userId, rating, review = null) {
  const isInitiator = this.initiator.equals(userId);
  const ratingData = {
    rating,
    review,
    ratedAt: new Date()
  };
  
  if (isInitiator) {
    this.ratings.initiatorRating = ratingData;
  } else {
    this.ratings.recipientRating = ratingData;
  }
  
  return await this.save();
};

module.exports = mongoose.model('Swap', swapSchema); 
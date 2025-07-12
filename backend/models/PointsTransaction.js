const mongoose = require('mongoose');

const pointsTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for points transaction']
  },
  type: {
    type: String,
    enum: {
      values: [
        'earned',        // User earned points
        'spent',         // User spent points
        'awarded',       // Admin awarded points
        'deducted',      // Admin deducted points
        'refund',        // Points refunded
        'bonus',         // Bonus points
        'penalty',       // Penalty deduction
        'swap',          // Points from swap transaction
        'registration'   // Initial registration points
      ],
      message: 'Please select a valid transaction type'
    },
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    validate: {
      validator: function(v) {
        return v !== 0;
      },
      message: 'Transaction amount cannot be zero'
    }
  },
  balance: {
    type: Number,
    required: [true, 'Balance after transaction is required'],
    min: [0, 'Balance cannot be negative']
  },
  reason: {
    type: String,
    required: [true, 'Transaction reason is required'],
    trim: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  reference: {
    model: {
      type: String,
      enum: ['Item', 'Swap', 'User', 'Admin']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reference.model'
    }
  },
  metadata: {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    swapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Swap'
    },
    source: {
      type: String,
      enum: ['system', 'admin', 'user', 'automatic']
    },
    ipAddress: String,
    userAgent: String
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed', 'reversed'],
      message: 'Please select a valid transaction status'
    },
    default: 'completed'
  },
  processedAt: {
    type: Date,
    default: Date.now
  },
  reversedAt: Date,
  reversalReason: {
    type: String,
    trim: true,
    maxlength: [300, 'Reversal reason cannot exceed 300 characters']
  },
  reversedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to determine if transaction is credit or debit
pointsTransactionSchema.virtual('isCredit').get(function() {
  return this.amount > 0;
});

pointsTransactionSchema.virtual('isDebit').get(function() {
  return this.amount < 0;
});

// Virtual for formatted amount
pointsTransactionSchema.virtual('formattedAmount').get(function() {
  const prefix = this.amount > 0 ? '+' : '';
  return `${prefix}${this.amount}`;
});

// Index for efficient queries
pointsTransactionSchema.index({ user: 1, createdAt: -1 });
pointsTransactionSchema.index({ type: 1, createdAt: -1 });
pointsTransactionSchema.index({ status: 1 });
pointsTransactionSchema.index({ 'reference.model': 1, 'reference.id': 1 });
pointsTransactionSchema.index({ processedAt: -1 });

// Static method to get user's transaction history
pointsTransactionSchema.statics.getUserHistory = function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    type = null,
    status = 'completed',
    startDate = null,
    endDate = null
  } = options;

  const query = { user: userId };
  
  if (type) {
    query.type = type;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('reference.id')
    .populate('metadata.adminId', 'username firstName lastName')
    .populate('metadata.itemId', 'title')
    .populate('metadata.swapId');
};

// Static method to get points statistics
pointsTransactionSchema.statics.getPointsStats = async function(userId = null) {
  const matchStage = userId ? { user: userId } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalEarned: {
          $sum: {
            $cond: [{ $gt: ['$amount', 0] }, '$amount', 0]
          }
        },
        totalSpent: {
          $sum: {
            $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0]
          }
        },
        avgTransaction: { $avg: '$amount' },
        lastTransaction: { $max: '$createdAt' }
      }
    }
  ]);
  
  return stats[0] || {
    totalTransactions: 0,
    totalEarned: 0,
    totalSpent: 0,
    avgTransaction: 0,
    lastTransaction: null
  };
};

// Static method to get transaction summary by type
pointsTransactionSchema.statics.getTransactionSummary = async function(userId = null, days = 30) {
  const matchStage = {
    createdAt: {
      $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    }
  };
  
  if (userId) {
    matchStage.user = userId;
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to create transaction
pointsTransactionSchema.statics.createTransaction = async function(transactionData) {
  const User = mongoose.model('User');
  
  // Validate user exists and get current balance
  const user = await User.findById(transactionData.user);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Calculate new balance
  const newBalance = user.points + transactionData.amount;
  
  if (newBalance < 0) {
    throw new Error('Insufficient points for this transaction');
  }
  
  // Create transaction record
  const transaction = new this({
    ...transactionData,
    balance: newBalance,
    status: 'completed',
    processedAt: new Date()
  });
  
  // Update user's points balance
  await User.findByIdAndUpdate(
    transactionData.user,
    { points: newBalance },
    { new: true }
  );
  
  return await transaction.save();
};

// Static method to reverse transaction
pointsTransactionSchema.statics.reverseTransaction = async function(transactionId, reversalReason, reversedBy) {
  const transaction = await this.findById(transactionId);
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.status === 'reversed') {
    throw new Error('Transaction already reversed');
  }
  
  // Create reverse transaction
  const reverseAmount = -transaction.amount;
  const reverseTransaction = await this.createTransaction({
    user: transaction.user,
    type: 'refund',
    amount: reverseAmount,
    reason: `Reversal: ${reversalReason}`,
    description: `Reversal of transaction ${transactionId}`,
    reference: {
      model: 'PointsTransaction',
      id: transactionId
    },
    metadata: {
      adminId: reversedBy,
      source: 'admin'
    }
  });
  
  // Mark original transaction as reversed
  transaction.status = 'reversed';
  transaction.reversedAt = new Date();
  transaction.reversalReason = reversalReason;
  transaction.reversedBy = reversedBy;
  
  await transaction.save();
  
  return reverseTransaction;
};

// Instance method to reverse this transaction
pointsTransactionSchema.methods.reverse = async function(reason, reversedBy) {
  return this.constructor.reverseTransaction(this._id, reason, reversedBy);
};

// Pre-save middleware for validation
pointsTransactionSchema.pre('save', function(next) {
  // Ensure amount is never zero
  if (this.amount === 0) {
    return next(new Error('Transaction amount cannot be zero'));
  }
  
  // Set metadata source if not provided
  if (!this.metadata.source) {
    this.metadata.source = 'system';
  }
  
  next();
});

module.exports = mongoose.model('PointsTransaction', pointsTransactionSchema); 
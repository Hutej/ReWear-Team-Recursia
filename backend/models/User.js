const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  profilePhoto: {
    public_id: String,
    url: String
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  location: {
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  points: {
    type: Number,
    default: function() {
      return parseInt(process.env.DEFAULT_USER_POINTS) || 100;
    },
    min: [0, 'Points cannot be negative']
  },
  preferences: {
    sizes: [String],
    categories: [String],
    emailNotifications: {
      type: Boolean,
      default: true
    },
    swapRequests: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for user's items count
userSchema.virtual('itemsCount', {
  ref: 'Item',
  localField: '_id',
  foreignField: 'owner',
  count: true
});

// Virtual for user's completed swaps count
userSchema.virtual('swapsCount', {
  ref: 'Swap',
  localField: '_id',
  foreignField: 'participants',
  count: true
});

// Index for text search
userSchema.index({
  username: 'text',
  firstName: 'text',
  lastName: 'text',
  'location.city': 'text'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastLogin on authentication
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    return next();
  }
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      isAdmin: this.isAdmin 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Static method to get user statistics
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        totalPoints: { $sum: '$points' },
        averagePoints: { $avg: '$points' }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    totalPoints: 0,
    averagePoints: 0
  };
};

module.exports = mongoose.model('User', userSchema); 
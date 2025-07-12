const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'tops',
        'bottoms', 
        'dresses',
        'outerwear',
        'shoes',
        'accessories',
        'activewear',
        'sleepwear',
        'formal',
        'vintage',
        'other'
      ],
      message: 'Please select a valid category'
    }
  },
  type: {
    type: String,
    required: [true, 'Item type is required'],
    trim: true,
    maxlength: [50, 'Type cannot exceed 50 characters']
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    enum: {
      values: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', 'One Size'],
      message: 'Please select a valid size'
    }
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: {
      values: [
        'new_with_tags',
        'like_new',
        'excellent',
        'good',
        'fair',
        'poor'
      ],
      message: 'Please select a valid condition'
    }
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  material: {
    type: String,
    trim: true,
    maxlength: [100, 'Material cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Item owner is required']
  },
  status: {
    type: String,
    enum: {
      values: [
        'available',
        'pending_approval',
        'requested',
        'swapped',
        'withdrawn',
        'rejected'
      ],
      message: 'Please select a valid status'
    },
    default: 'pending_approval'
  },
  availability: {
    type: String,
    enum: {
      values: ['available', 'unavailable'],
      message: 'Please select valid availability'
    },
    default: 'available'
  },
  pointsValue: {
    type: Number,
    min: [1, 'Points value must be at least 1'],
    max: [100, 'Points value cannot exceed 100'],
    default: function() {
      // Auto-calculate points based on condition and category
      const conditionPoints = {
        'new_with_tags': 20,
        'like_new': 18,
        'excellent': 15,
        'good': 12,
        'fair': 8,
        'poor': 5
      };
      
      const categoryBonus = {
        'formal': 5,
        'outerwear': 3,
        'shoes': 2,
        'dresses': 2
      };
      
      let points = conditionPoints[this.condition] || 10;
      points += categoryBonus[this.category] || 0;
      
      return Math.min(points, 100);
    }
  },
  measurements: {
    chest: Number,
    waist: Number,
    length: Number,
    inseam: Number,
    notes: {
      type: String,
      maxlength: [200, 'Measurement notes cannot exceed 200 characters']
    }
  },
  preferences: {
    swapOnly: {
      type: Boolean,
      default: false
    },
    preferredCategories: [String],
    preferredSizes: [String]
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderationNotes: {
    type: String,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  featured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for condition display name
itemSchema.virtual('conditionDisplay').get(function() {
  const conditionMap = {
    'new_with_tags': 'New with Tags',
    'like_new': 'Like New',
    'excellent': 'Excellent',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor'
  };
  return conditionMap[this.condition] || this.condition;
});

// Virtual for category display name
itemSchema.virtual('categoryDisplay').get(function() {
  const categoryMap = {
    'tops': 'Tops',
    'bottoms': 'Bottoms', 
    'dresses': 'Dresses',
    'outerwear': 'Outerwear',
    'shoes': 'Shoes',
    'accessories': 'Accessories',
    'activewear': 'Activewear',
    'sleepwear': 'Sleepwear',
    'formal': 'Formal',
    'vintage': 'Vintage',
    'other': 'Other'
  };
  return categoryMap[this.category] || this.category;
});

// Virtual for favorites count
itemSchema.virtual('favoritesCount').get(function() {
  return this.favorites ? this.favorites.length : 0;
});

// Index for search functionality
itemSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  tags: 'text',
  type: 'text'
});

// Compound indexes for filtering
itemSchema.index({ category: 1, size: 1, condition: 1 });
itemSchema.index({ owner: 1, status: 1 });
itemSchema.index({ status: 1, createdAt: -1 });
itemSchema.index({ featured: 1, createdAt: -1 });

// Geospatial index for location-based searches (if we add coordinates later)
itemSchema.index({ 'owner.location': '2dsphere' });

// Pre-save middleware to set points value
itemSchema.pre('save', function(next) {
  if (this.isNew && !this.pointsValue) {
    // Points already calculated in default function
  }
  next();
});

// Static method to get item statistics
itemSchema.statics.getItemStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        availableItems: {
          $sum: {
            $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
          }
        },
        swappedItems: {
          $sum: {
            $cond: [{ $eq: ['$status', 'swapped'] }, 1, 0]
          }
        },
        avgPointsValue: { $avg: '$pointsValue' }
      }
    }
  ]);
  
  return stats[0] || {
    totalItems: 0,
    availableItems: 0,
    swappedItems: 0,
    avgPointsValue: 0
  };
};

// Static method to get category distribution
itemSchema.statics.getCategoryStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPoints: { $avg: '$pointsValue' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Instance method to add to favorites
itemSchema.methods.addToFavorites = function(userId) {
  if (!this.favorites.includes(userId)) {
    this.favorites.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove from favorites
itemSchema.methods.removeFromFavorites = function(userId) {
  this.favorites = this.favorites.filter(id => !id.equals(userId));
  return this.save();
};

// Instance method to increment views
itemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Item', itemSchema); 
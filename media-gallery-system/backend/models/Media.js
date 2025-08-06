const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original name is required']
  },
  mimetype: {
    type: String,
    required: [true, 'MIME type is required'],
    enum: ['image/jpeg', 'image/jpg', 'image/png']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    max: [5 * 1024 * 1024, 'File size cannot exceed 5MB'] // 5MB limit
  },
  cloudinaryUrl: {
    type: String,
    required: [true, 'Cloudinary URL is required']
  },
  cloudinaryPublicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required']
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  gallery: {
    type: String,
    enum: ['personal', 'shared'],
    default: 'personal'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  metadata: {
    width: Number,
    height: Number,
    format: String,
    colorSpace: String,
    hasAlpha: Boolean
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
mediaSchema.index({ uploadedBy: 1, createdAt: -1 });
mediaSchema.index({ gallery: 1, isActive: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Text search
mediaSchema.index({ createdAt: -1 });

// Virtual for file URL (for backwards compatibility)
mediaSchema.virtual('url').get(function() {
  return this.cloudinaryUrl;
});

// Virtual for thumbnail URL with fallback
mediaSchema.virtual('thumbnail').get(function() {
  return this.thumbnailUrl || this.cloudinaryUrl;
});

// Virtual for file size in readable format
mediaSchema.virtual('formattedSize').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.size === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Instance method to increment view count
mediaSchema.methods.incrementViewCount = function() {
  return this.updateOne({ $inc: { viewCount: 1 } });
};

// Instance method to increment download count
mediaSchema.methods.incrementDownloadCount = function() {
  return this.updateOne({ $inc: { downloadCount: 1 } });
};

// Instance method to add tags
mediaSchema.methods.addTags = function(newTags) {
  const tagsToAdd = newTags.filter(tag => !this.tags.includes(tag.toLowerCase()));
  if (tagsToAdd.length > 0) {
    this.tags.push(...tagsToAdd.map(tag => tag.toLowerCase()));
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove tags
mediaSchema.methods.removeTags = function(tagsToRemove) {
  this.tags = this.tags.filter(tag => !tagsToRemove.includes(tag));
  return this.save();
};

// Static method to find by user
mediaSchema.statics.findByUser = function(userId, options = {}) {
  const query = { uploadedBy: userId, isActive: true };
  if (options.gallery) query.gallery = options.gallery;
  if (options.tags) query.tags = { $in: options.tags };
  
  return this.find(query)
    .populate('uploadedBy', 'name email avatar')
    .sort(options.sort || { createdAt: -1 });
};

// Static method to search media
mediaSchema.statics.searchMedia = function(searchQuery, options = {}) {
  const query = { isActive: true };
  
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }
  
  if (options.userId) query.uploadedBy = options.userId;
  if (options.gallery) query.gallery = options.gallery;
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  let queryBuilder = this.find(query)
    .populate('uploadedBy', 'name email avatar');
  
  if (searchQuery) {
    queryBuilder = queryBuilder.sort({ score: { $meta: 'textScore' } });
  } else {
    queryBuilder = queryBuilder.sort(options.sort || { createdAt: -1 });
  }
  
  if (options.limit) queryBuilder = queryBuilder.limit(options.limit);
  if (options.skip) queryBuilder = queryBuilder.skip(options.skip);
  
  return queryBuilder;
};

// Static method to get popular tags
mediaSchema.statics.getPopularTags = function(limit = 20) {
  return this.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { tag: '$_id', count: 1, _id: 0 } }
  ]);
};

// Static method to get media stats for dashboard
mediaSchema.statics.getMediaStats = function(userId = null) {
  const matchStage = { isActive: true };
  if (userId) matchStage.uploadedBy = new mongoose.Types.ObjectId(userId);
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        totalSize: { $sum: '$size' },
        personalCount: {
          $sum: { $cond: [{ $eq: ['$gallery', 'personal'] }, 1, 0] }
        },
        sharedCount: {
          $sum: { $cond: [{ $eq: ['$gallery', 'shared'] }, 1, 0] }
        },
        totalViews: { $sum: '$viewCount' },
        totalDownloads: { $sum: '$downloadCount' }
      }
    }
  ]);
};

// Pre-remove middleware to clean up Cloudinary resources
mediaSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const cloudinary = require('cloudinary').v2;
    if (this.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(this.cloudinaryPublicId);
    }
    next();
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    next(); // Continue with deletion even if Cloudinary cleanup fails
  }
});

module.exports = mongoose.model('Media', mediaSchema);
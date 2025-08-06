const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Link to user account if logged in, null for anonymous messages
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'replied'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
contactSchema.index({ createdAt: -1 });
contactSchema.index({ userId: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ isActive: 1 });
contactSchema.index({ email: 1 });

// Virtual for message preview (first 100 characters)
contactSchema.virtual('messagePreview').get(function() {
  return this.message.length > 100 ? 
    this.message.substring(0, 100) + '...' : 
    this.message;
});

// Virtual for formatted creation date
contactSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Instance method to mark as read
contactSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Instance method to mark as replied
contactSchema.methods.markAsReplied = function() {
  this.status = 'replied';
  return this.save();
};

// Instance method to soft delete
contactSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

// Static method to find messages by user
contactSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId, isActive: true };
  
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to find all messages (admin)
contactSchema.statics.findAllMessages = function(options = {}) {
  const query = { isActive: true };
  
  if (options.status) query.status = options.status;
  if (options.email) query.email = new RegExp(options.email, 'i');
  if (options.name) query.name = new RegExp(options.name, 'i');
  
  let queryBuilder = this.find(query)
    .populate('userId', 'name email avatar')
    .sort(options.sort || { createdAt: -1 });
  
  if (options.limit) queryBuilder = queryBuilder.limit(options.limit);
  if (options.skip) queryBuilder = queryBuilder.skip(options.skip);
  
  return queryBuilder;
};

// Static method to get contact stats
contactSchema.statics.getContactStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        pendingMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        readMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        repliedMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] }
        },
        uniqueEmails: { $addToSet: '$email' }
      }
    },
    {
      $project: {
        totalMessages: 1,
        pendingMessages: 1,
        readMessages: 1,
        repliedMessages: 1,
        uniqueEmailsCount: { $size: '$uniqueEmails' }
      }
    }
  ]);
};

// Static method to get recent messages
contactSchema.statics.getRecentMessages = function(limit = 5) {
  return this.find({ isActive: true })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('name email messagePreview status createdAt userId');
};

// Static method to search messages
contactSchema.statics.searchMessages = function(searchQuery, options = {}) {
  const query = { isActive: true };
  
  if (searchQuery) {
    query.$or = [
      { name: new RegExp(searchQuery, 'i') },
      { email: new RegExp(searchQuery, 'i') },
      { message: new RegExp(searchQuery, 'i') }
    ];
  }
  
  if (options.status) query.status = options.status;
  if (options.dateFrom) query.createdAt = { $gte: new Date(options.dateFrom) };
  if (options.dateTo) {
    query.createdAt = { 
      ...query.createdAt, 
      $lte: new Date(options.dateTo) 
    };
  }
  
  return this.find(query)
    .populate('userId', 'name email avatar')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

module.exports = mongoose.model('Contact', contactSchema);
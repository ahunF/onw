const { validationResult } = require('express-validator');
const User = require('../models/User');
const Media = require('../models/Media');
const Contact = require('../models/Contact');

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const users = await User.find(query)
      .select('-password -verificationOTP -resetPasswordOTP -loginAttempts -lockUntil')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -verificationOTP -resetPasswordOTP');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const mediaStats = await Media.getMediaStats(user._id);
    const messageCount = await Contact.countDocuments({ 
      userId: user._id, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        user,
        stats: {
          media: mediaStats[0] || {},
          messageCount
        }
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Update user
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, email, role, isActive, isVerified } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deactivation or role change for the current admin
    if (user._id.toString() === req.user._id.toString()) {
      if (isActive === false) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account'
        });
      }
      if (role && role !== user.role) {
        return res.status(400).json({
          success: false,
          message: 'You cannot change your own role'
        });
      }
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Deactivate user (soft delete)
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Activate user
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User activated successfully'
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get user statistics
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
          },
          adminUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          regularUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent registrations
    const recentUsers = await User.find({ isActive: true })
      .select('name email role isVerified createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {},
        recentUsers
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Bulk update users
const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, updates } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates object is required'
      });
    }

    // Prevent updating the current admin
    const filteredUserIds = userIds.filter(id => id !== req.user._id.toString());

    if (filteredUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot perform bulk operations on your own account'
      });
    }

    // Validate update fields
    const allowedUpdates = ['isActive', 'role', 'isVerified'];
    const updateFields = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        updateFields[key] = value;
      }
    }

    const result = await User.updateMany(
      { _id: { $in: filteredUserIds } },
      updateFields
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} users updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Bulk update users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Search users
const searchUsers = async (req, res) => {
  try {
    const {
      q: query,
      page = 1,
      limit = 20,
      role,
      isActive,
      isVerified
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ]
    };

    if (role) searchQuery.role = role;
    if (isActive !== undefined) searchQuery.isActive = isActive === 'true';
    if (isVerified !== undefined) searchQuery.isVerified = isVerified === 'true';

    const users = await User.find(searchQuery)
      .select('-password -verificationOTP -resetPasswordOTP -loginAttempts -lockUntil')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        users,
        query,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get user activity (media uploads, contact messages)
const getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, type } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skip = (page - 1) * limit;
    let activities = [];

    if (!type || type === 'media') {
      const mediaActivity = await Media.find({ 
        uploadedBy: id, 
        isActive: true 
      })
      .select('title createdAt cloudinaryUrl thumbnailUrl')
      .sort({ createdAt: -1 })
      .skip(type === 'media' ? skip : 0)
      .limit(type === 'media' ? parseInt(limit) : 5);

      activities.push(...mediaActivity.map(item => ({
        type: 'media',
        id: item._id,
        title: item.title,
        createdAt: item.createdAt,
        thumbnail: item.thumbnailUrl || item.cloudinaryUrl
      })));
    }

    if (!type || type === 'contact') {
      const contactActivity = await Contact.find({ 
        userId: id, 
        isActive: true 
      })
      .select('message status createdAt')
      .sort({ createdAt: -1 })
      .skip(type === 'contact' ? skip : 0)
      .limit(type === 'contact' ? parseInt(limit) : 5);

      activities.push(...contactActivity.map(item => ({
        type: 'contact',
        id: item._id,
        message: item.messagePreview,
        status: item.status,
        createdAt: item.createdAt
      })));
    }

    // Sort by creation date if mixed type
    if (!type) {
      activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      activities = activities.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: { activities }
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  getUserStats,
  bulkUpdateUsers,
  searchUsers,
  getUserActivity
};
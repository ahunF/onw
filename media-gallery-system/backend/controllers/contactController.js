const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');

// Submit contact message
const submitMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, message } = req.body;
    
    // Get user ID if authenticated
    const userId = req.user ? req.user._id : null;
    
    // Get client IP and user agent for tracking
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const contactMessage = new Contact({
      name,
      email,
      message,
      userId,
      ipAddress,
      userAgent
    });

    await contactMessage.save();

    // Populate user data if exists
    if (userId) {
      await contactMessage.populate('userId', 'name email avatar');
    }

    res.status(201).json({
      success: true,
      message: 'Message submitted successfully',
      data: { contact: contactMessage }
    });

  } catch (error) {
    console.error('Submit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's own messages
const getMyMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      status,
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      limit: parseInt(limit)
    };

    const messages = await Contact.findByUser(req.user._id, options);
    
    const total = await Contact.countDocuments({
      userId: req.user._id,
      isActive: true,
      ...(status && { status })
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get message by ID (user's own message)
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Contact.findById(id)
      .populate('userId', 'name email avatar');
    
    if (!message || !message.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check permissions - user can only view their own messages (or admin can view all)
    if (req.user.role !== 'admin' && 
        (!message.userId || message.userId._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { message }
    });

  } catch (error) {
    console.error('Get message by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user's own message
const updateMessage = async (req, res) => {
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
    const { name, email, message } = req.body;

    const contactMessage = await Contact.findById(id);
    
    if (!contactMessage || !contactMessage.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check permissions - user can only edit their own messages
    if (!contactMessage.userId || contactMessage.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Don't allow editing if message has been read or replied
    if (contactMessage.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit message that has been processed'
      });
    }

    // Update fields
    if (name) contactMessage.name = name;
    if (email) contactMessage.email = email;
    if (message) contactMessage.message = message;

    await contactMessage.save();

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: { contact: contactMessage }
    });

  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user's own message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findById(id);
    
    if (!message || !message.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check permissions - user can only delete their own messages
    if (!message.userId || message.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    await message.softDelete();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get all messages
const getAllMessages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    const skip = (page - 1) * limit;
    
    const options = {
      status,
      email: search,
      name: search,
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: parseInt(skip),
      dateFrom,
      dateTo
    };

    let messages;
    let total;

    if (search) {
      messages = await Contact.searchMessages(search, options);
      total = await Contact.searchMessages(search, { ...options, limit: null, skip: null }).countDocuments();
    } else {
      messages = await Contact.findAllMessages(options);
      
      // Build count query
      let countQuery = { isActive: true };
      if (status) countQuery.status = status;
      if (dateFrom) countQuery.createdAt = { $gte: new Date(dateFrom) };
      if (dateTo) {
        countQuery.createdAt = { 
          ...countQuery.createdAt, 
          $lte: new Date(dateTo) 
        };
      }
      
      total = await Contact.countDocuments(countQuery);
    }

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Update message status
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status || !['pending', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, read, or replied'
      });
    }

    const message = await Contact.findById(id);
    
    if (!message || !message.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.status = status;
    if (adminNotes !== undefined) message.adminNotes = adminNotes;

    await message.save();
    await message.populate('userId', 'name email avatar');

    res.json({
      success: true,
      message: 'Message status updated successfully',
      data: { contact: message }
    });

  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Delete any message
const adminDeleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findById(id);
    
    if (!message || !message.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Soft delete
    await message.softDelete();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get contact statistics
const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.getContactStats();
    const recentMessages = await Contact.getRecentMessages(5);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {},
        recentMessages
      }
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Bulk update message status
const bulkUpdateStatus = async (req, res) => {
  try {
    const { messageIds, status } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message IDs array is required'
      });
    }

    if (!status || !['pending', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, read, or replied'
      });
    }

    const result = await Contact.updateMany(
      { 
        _id: { $in: messageIds },
        isActive: true 
      },
      { status }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} messages updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Bulk update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Bulk delete messages
const bulkDeleteMessages = async (req, res) => {
  try {
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message IDs array is required'
      });
    }

    const result = await Contact.updateMany(
      { 
        _id: { $in: messageIds },
        isActive: true 
      },
      { isActive: false }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} messages deleted successfully`,
      data: { deletedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Bulk delete messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  submitMessage,
  getMyMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getAllMessages,
  updateMessageStatus,
  adminDeleteMessage,
  getContactStats,
  bulkUpdateStatus,
  bulkDeleteMessages
};
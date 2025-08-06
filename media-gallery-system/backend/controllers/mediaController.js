const { validationResult } = require('express-validator');
const Media = require('../models/Media');
const { generateThumbnail, deleteFromCloudinary, createImageZip } = require('../utils/upload');

// Upload single media file
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, tags, gallery } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Parse tags (if sent as string)
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (error) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : [];
      }
    }

    // Generate thumbnail
    const thumbnailUrl = generateThumbnail(req.file.path);

    // Create media document
    const media = new Media({
      title,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      cloudinaryUrl: req.file.path,
      cloudinaryPublicId: req.file.filename,
      thumbnailUrl,
      tags: parsedTags,
      gallery: gallery || 'personal',
      uploadedBy: req.user._id,
      metadata: {
        width: req.file.width,
        height: req.file.height,
        format: req.file.format
      }
    });

    await media.save();

    // Populate user data
    await media.populate('uploadedBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: { media }
    });

  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Upload multiple media files
const uploadMultipleMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { gallery } = req.body;
    const uploadedMedia = [];

    for (const file of req.files) {
      try {
        const thumbnailUrl = generateThumbnail(file.path);
        
        const media = new Media({
          title: file.originalname.split('.')[0], // Use filename without extension as title
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          cloudinaryUrl: file.path,
          cloudinaryPublicId: file.filename,
          thumbnailUrl,
          gallery: gallery || 'personal',
          uploadedBy: req.user._id,
          metadata: {
            width: file.width,
            height: file.height,
            format: file.format
          }
        });

        await media.save();
        await media.populate('uploadedBy', 'name email avatar');
        uploadedMedia.push(media);
      } catch (error) {
        console.error('Error saving media:', error);
        // Continue with other files
      }
    }

    res.status(201).json({
      success: true,
      message: `${uploadedMedia.length} media files uploaded successfully`,
      data: { media: uploadedMedia }
    });

  } catch (error) {
    console.error('Upload multiple media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's media with pagination and filters
const getMyMedia = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      gallery,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const options = {
      userId: req.user._id,
      gallery,
      tags: tags ? tags.split(',') : undefined,
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: parseInt(skip)
    };

    let media;
    let total;

    if (search) {
      media = await Media.searchMedia(search, options);
      total = await Media.searchMedia(search, { ...options, limit: null, skip: null }).countDocuments();
    } else {
      media = await Media.findByUser(req.user._id, options);
      total = await Media.countDocuments({
        uploadedBy: req.user._id,
        isActive: true,
        ...(gallery && { gallery }),
        ...(options.tags && { tags: { $in: options.tags } })
      });
    }

    res.json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all media (admin or shared gallery)
const getAllMedia = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      gallery,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build query
    let query = { isActive: true };
    
    // If not admin, only show shared gallery
    if (req.user.role !== 'admin') {
      query.gallery = 'shared';
    } else if (gallery) {
      query.gallery = gallery;
    }
    
    if (userId) query.uploadedBy = userId;
    if (tags) query.tags = { $in: tags.split(',') };

    let media;
    let total;

    if (search) {
      const options = {
        ...(req.user.role !== 'admin' && { gallery: 'shared' }),
        ...(gallery && req.user.role === 'admin' && { gallery }),
        ...(userId && { userId }),
        ...(tags && { tags: tags.split(',') }),
        sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
        limit: parseInt(limit),
        skip: parseInt(skip)
      };
      
      media = await Media.searchMedia(search, options);
      total = await Media.searchMedia(search, { ...options, limit: null, skip: null }).countDocuments();
    } else {
      media = await Media.find(query)
        .populate('uploadedBy', 'name email avatar')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await Media.countDocuments(query);
    }

    res.json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single media by ID
const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const media = await Media.findById(id)
      .populate('uploadedBy', 'name email avatar');
    
    if (!media || !media.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check permissions - user can view their own media or shared media
    if (media.uploadedBy._id.toString() !== req.user._id.toString() && 
        media.gallery !== 'shared' && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment view count
    await media.incrementViewCount();

    res.json({
      success: true,
      data: { media }
    });

  } catch (error) {
    console.error('Get media by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update media
const updateMedia = async (req, res) => {
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
    const { title, description, tags, gallery } = req.body;

    const media = await Media.findById(id);
    
    if (!media || !media.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check permissions
    if (media.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update fields
    if (title) media.title = title;
    if (description !== undefined) media.description = description;
    if (tags) media.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (gallery) media.gallery = gallery;

    await media.save();
    await media.populate('uploadedBy', 'name email avatar');

    res.json({
      success: true,
      message: 'Media updated successfully',
      data: { media }
    });

  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete media
const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);
    
    if (!media || !media.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check permissions
    if (media.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    media.isActive = false;
    await media.save();

    // Optional: Delete from Cloudinary (uncomment if you want hard delete)
    // await deleteFromCloudinary(media.cloudinaryPublicId);

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });

  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete multiple media
const deleteMultipleMedia = async (req, res) => {
  try {
    const { mediaIds } = req.body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Media IDs array is required'
      });
    }

    const media = await Media.find({
      _id: { $in: mediaIds },
      isActive: true
    });

    if (media.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No media found'
      });
    }

    // Check permissions for each media
    const allowedMedia = media.filter(item => 
      item.uploadedBy.toString() === req.user._id.toString() || req.user.role === 'admin'
    );

    if (allowedMedia.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete allowed media
    await Media.updateMany(
      { _id: { $in: allowedMedia.map(item => item._id) } },
      { isActive: false }
    );

    res.json({
      success: true,
      message: `${allowedMedia.length} media files deleted successfully`
    });

  } catch (error) {
    console.error('Delete multiple media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Download media as ZIP
const downloadAsZip = async (req, res) => {
  try {
    const { mediaIds } = req.body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Media IDs array is required'
      });
    }

    const media = await Media.find({
      _id: { $in: mediaIds },
      isActive: true
    });

    if (media.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No media found'
      });
    }

    // Check permissions and filter accessible media
    const allowedMedia = media.filter(item => 
      item.uploadedBy.toString() === req.user._id.toString() || 
      item.gallery === 'shared' ||
      req.user.role === 'admin'
    );

    if (allowedMedia.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prepare image data for ZIP creation
    const imageData = allowedMedia.map(item => ({
      url: item.cloudinaryUrl,
      filename: `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.${item.filename.split('.').pop()}`,
      format: item.metadata.format || 'jpg'
    }));

    // Create ZIP buffer
    const zipBuffer = await createImageZip(imageData, 'media-gallery');

    // Increment download count for each media
    await Promise.all(allowedMedia.map(item => item.incrementDownloadCount()));

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="media-gallery-${Date.now()}.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);

    // Send ZIP file
    res.send(zipBuffer);

  } catch (error) {
    console.error('Download ZIP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get media statistics
const getMediaStats = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user._id;
    const stats = await Media.getMediaStats(userId);

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });

  } catch (error) {
    console.error('Get media stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get popular tags
const getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const tags = await Media.getPopularTags(parseInt(limit));

    res.json({
      success: true,
      data: { tags }
    });

  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Search media
const searchMedia = async (req, res) => {
  try {
    const {
      q: query,
      page = 1,
      limit = 12,
      gallery,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const skip = (page - 1) * limit;
    const options = {
      userId: req.user.role === 'admin' ? undefined : req.user._id,
      gallery: req.user.role === 'admin' ? gallery : (gallery === 'shared' ? 'shared' : undefined),
      tags: tags ? tags.split(',') : undefined,
      sort: query ? undefined : { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: parseInt(skip)
    };

    const media = await Media.searchMedia(query, options);
    const total = await Media.searchMedia(query, { ...options, limit: null, skip: null }).countDocuments();

    res.json({
      success: true,
      data: {
        media,
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
    console.error('Search media error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  uploadMedia,
  uploadMultipleMedia,
  getMyMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  deleteMultipleMedia,
  downloadAsZip,
  getMediaStats,
  getPopularTags,
  searchMedia
};
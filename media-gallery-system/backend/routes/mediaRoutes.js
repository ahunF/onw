const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
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
} = require('../controllers/mediaController');

const {
  verifyToken,
  requireAdmin,
  uploadRateLimit,
  apiRateLimit,
  logActivity
} = require('../middlewares/auth');

const {
  uploadWithErrorHandling,
  uploadMultipleWithErrorHandling
} = require('../utils/upload');

// Validation rules
const updateMediaValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('gallery')
    .optional()
    .isIn(['personal', 'shared'])
    .withMessage('Gallery must be either personal or shared'),
  body('tags')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string' && tag.length <= 30);
      }
      return true;
    })
    .withMessage('Each tag must be a string with maximum 30 characters')
];

// Public routes (with optional authentication)
router.get('/shared', getAllMedia); // Show shared media
router.get('/search', searchMedia); // Search media
router.get('/tags', getPopularTags); // Get popular tags

// Protected routes (authentication required)
router.use(verifyToken);

// Single file upload
router.post('/upload', 
  uploadRateLimit,
  logActivity('media_upload'),
  uploadWithErrorHandling,
  uploadMedia
);

// Multiple file upload
router.post('/upload-multiple',
  uploadRateLimit,
  logActivity('media_upload_multiple'),
  uploadMultipleWithErrorHandling,
  uploadMultipleMedia
);

// Get user's media
router.get('/my-media', getMyMedia);

// Get all media (admin can see all, users see shared only)
router.get('/', getAllMedia);

// Get media statistics
router.get('/stats', getMediaStats);

// Get single media by ID
router.get('/:id', getMediaById);

// Update media
router.put('/:id', 
  updateMediaValidation,
  logActivity('media_update'),
  updateMedia
);

// Delete single media
router.delete('/:id',
  logActivity('media_delete'),
  deleteMedia
);

// Delete multiple media
router.delete('/',
  logActivity('media_delete_multiple'),
  deleteMultipleMedia
);

// Download selected media as ZIP
router.post('/download/zip',
  logActivity('media_download_zip'),
  downloadAsZip
);

module.exports = router;
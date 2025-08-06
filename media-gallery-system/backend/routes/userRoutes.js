const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  getUserStats,
  bulkUpdateUsers,
  searchUsers,
  getUserActivity
} = require('../controllers/userController');

const {
  verifyToken,
  requireAdmin,
  apiRateLimit,
  logActivity
} = require('../middlewares/auth');

// Validation rules
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean')
];

const bulkUpdateValidation = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be an array with at least one user ID'),
  body('updates')
    .isObject()
    .withMessage('updates must be an object'),
  body('updates.isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('updates.role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('role must be either admin or user'),
  body('updates.isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean')
];

// All routes require authentication and admin privileges
router.use(verifyToken, requireAdmin);

// Get all users with pagination and filters
router.get('/',
  apiRateLimit,
  getAllUsers
);

// Get user statistics
router.get('/stats',
  getUserStats
);

// Search users
router.get('/search',
  searchUsers
);

// Get user by ID
router.get('/:id',
  getUserById
);

// Get user activity
router.get('/:id/activity',
  getUserActivity
);

// Update user
router.put('/:id',
  updateUserValidation,
  logActivity('user_update'),
  updateUser
);

// Deactivate user
router.patch('/:id/deactivate',
  logActivity('user_deactivate'),
  deactivateUser
);

// Activate user
router.patch('/:id/activate',
  logActivity('user_activate'),
  activateUser
);

// Bulk update users
router.put('/bulk/update',
  bulkUpdateValidation,
  logActivity('user_bulk_update'),
  bulkUpdateUsers
);

module.exports = router;
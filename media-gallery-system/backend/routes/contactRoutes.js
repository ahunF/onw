const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
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
} = require('../controllers/contactController');

const {
  verifyToken,
  optionalAuth,
  requireAdmin,
  contactRateLimit,
  apiRateLimit,
  logActivity
} = require('../middlewares/auth');

// Validation rules
const submitMessageValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

const updateMessageValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'read', 'replied'])
    .withMessage('Status must be pending, read, or replied'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes cannot exceed 500 characters')
];

// Public route - submit message (with optional authentication)
router.post('/',
  contactRateLimit,
  optionalAuth,
  submitMessageValidation,
  logActivity('contact_submit'),
  submitMessage
);

// Protected routes - require authentication
router.use(verifyToken);

// User routes - manage own messages
router.get('/my-messages', getMyMessages);
router.get('/:id', getMessageById);
router.put('/:id',
  updateMessageValidation,
  logActivity('contact_update'),
  updateMessage
);
router.delete('/:id',
  logActivity('contact_delete'),
  deleteMessage
);

// Admin routes
router.get('/admin/messages',
  requireAdmin,
  getAllMessages
);

router.get('/admin/stats',
  requireAdmin,
  getContactStats
);

router.put('/admin/:id/status',
  requireAdmin,
  updateStatusValidation,
  logActivity('contact_admin_update_status'),
  updateMessageStatus
);

router.delete('/admin/:id',
  requireAdmin,
  logActivity('contact_admin_delete'),
  adminDeleteMessage
);

router.put('/admin/bulk/status',
  requireAdmin,
  logActivity('contact_admin_bulk_update'),
  bulkUpdateStatus
);

router.delete('/admin/bulk',
  requireAdmin,
  logActivity('contact_admin_bulk_delete'),
  bulkDeleteMessages
);

module.exports = router;
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  register,
  verifyEmail,
  resendVerificationOTP,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');

const {
  verifyToken,
  loginRateLimit,
  apiRateLimit
} = require('../middlewares/auth');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Public routes (no authentication required)
router.post('/register', apiRateLimit, registerValidation, register);
router.post('/verify-email', apiRateLimit, verifyEmail);
router.post('/resend-verification', apiRateLimit, resendVerificationOTP);
router.post('/login', loginRateLimit, loginValidation, login);
router.post('/forgot-password', apiRateLimit, forgotPassword);
router.post('/reset-password', apiRateLimit, resetPassword);

// Protected routes (authentication required)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfileValidation, updateProfile);
router.put('/change-password', verifyToken, changePasswordValidation, changePassword);
router.post('/logout', verifyToken, logout);

module.exports = router;
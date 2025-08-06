import { get, post, put } from './api';

// Authentication API calls
export const authService = {
  // Register user
  register: async (userData) => {
    return await post('/auth/register', userData);
  },

  // Verify email with OTP
  verifyEmail: async (email, otp) => {
    return await post('/auth/verify-email', { email, otp });
  },

  // Resend verification OTP
  resendVerificationOTP: async (email) => {
    return await post('/auth/resend-verification', { email });
  },

  // Login user
  login: async (email, password) => {
    return await post('/auth/login', { email, password });
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await post('/auth/forgot-password', { email });
  },

  // Reset password with OTP
  resetPassword: async (email, otp, newPassword) => {
    return await post('/auth/reset-password', { email, otp, newPassword });
  },

  // Get current user profile
  getProfile: async () => {
    return await get('/auth/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await put('/auth/profile', profileData);
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await put('/auth/change-password', { currentPassword, newPassword });
  },

  // Logout user
  logout: async () => {
    return await post('/auth/logout');
  }
};

export default authService;
import { get, post, put, patch, del } from './api'

export const userService = {
  // Admin: Get all users
  getAllUsers: async (params = {}) => {
    return await get('/users', params)
  },

  // Admin: Get user by ID
  getUserById: async (id) => {
    return await get(`/users/${id}`)
  },

  // Admin: Get user statistics
  getUserStats: async () => {
    return await get('/users/stats')
  },

  // Admin: Search users
  searchUsers: async (query, params = {}) => {
    return await get('/users/search', { q: query, ...params })
  },

  // Admin: Get user activity
  getUserActivity: async (id, params = {}) => {
    return await get(`/users/${id}/activity`, params)
  },

  // Admin: Update user
  updateUser: async (id, userData) => {
    return await put(`/users/${id}`, userData)
  },

  // Admin: Deactivate user
  deactivateUser: async (id) => {
    return await patch(`/users/${id}/deactivate`)
  },

  // Admin: Activate user
  activateUser: async (id) => {
    return await patch(`/users/${id}/activate`)
  },

  // Admin: Bulk update users
  bulkUpdateUsers: async (userIds, updates) => {
    return await put('/users/bulk/update', { userIds, updates })
  }
}

export default userService
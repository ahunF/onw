import { get, post, put, del } from './api'

export const contactService = {
  // Submit contact message
  submitMessage: async (messageData) => {
    return await post('/contact', messageData)
  },

  // Get user's own messages
  getMyMessages: async (params = {}) => {
    return await get('/contact/my-messages', params)
  },

  // Get message by ID
  getMessageById: async (id) => {
    return await get(`/contact/${id}`)
  },

  // Update user's own message
  updateMessage: async (id, messageData) => {
    return await put(`/contact/${id}`, messageData)
  },

  // Delete user's own message
  deleteMessage: async (id) => {
    return await del(`/contact/${id}`)
  },

  // Admin: Get all messages
  getAllMessages: async (params = {}) => {
    return await get('/contact/admin/messages', params)
  },

  // Admin: Get contact statistics
  getContactStats: async () => {
    return await get('/contact/admin/stats')
  },

  // Admin: Update message status
  updateMessageStatus: async (id, status, adminNotes) => {
    return await put(`/contact/admin/${id}/status`, { status, adminNotes })
  },

  // Admin: Delete any message
  adminDeleteMessage: async (id) => {
    return await del(`/contact/admin/${id}`)
  },

  // Admin: Bulk update message status
  bulkUpdateStatus: async (messageIds, status) => {
    return await put('/contact/admin/bulk/status', { messageIds, status })
  },

  // Admin: Bulk delete messages
  bulkDeleteMessages: async (messageIds) => {
    return await del('/contact/admin/bulk', { messageIds })
  }
}

export default contactService
import { get, post, put, del, uploadFile, downloadFile } from './api'

export const mediaService = {
  // Upload single media file
  uploadMedia: async (formData, onProgress) => {
    return await uploadFile('/media/upload', formData, onProgress)
  },

  // Upload multiple media files
  uploadMultipleMedia: async (formData, onProgress) => {
    return await uploadFile('/media/upload-multiple', formData, onProgress)
  },

  // Get user's media
  getMyMedia: async (params = {}) => {
    return await get('/media/my-media', params)
  },

  // Get all media (public/shared)
  getAllMedia: async (params = {}) => {
    return await get('/media', params)
  },

  // Get shared media
  getSharedMedia: async (params = {}) => {
    return await get('/media/shared', params)
  },

  // Get media by ID
  getMediaById: async (id) => {
    return await get(`/media/${id}`)
  },

  // Update media
  updateMedia: async (id, mediaData) => {
    return await put(`/media/${id}`, mediaData)
  },

  // Delete media
  deleteMedia: async (id) => {
    return await del(`/media/${id}`)
  },

  // Delete multiple media
  deleteMultipleMedia: async (mediaIds) => {
    return await del('/media', { mediaIds })
  },

  // Download media as ZIP
  downloadAsZip: async (mediaIds, filename) => {
    return await downloadFile('/media/download/zip', filename, {
      method: 'POST',
      data: { mediaIds }
    })
  },

  // Get media statistics
  getMediaStats: async () => {
    return await get('/media/stats')
  },

  // Get popular tags
  getPopularTags: async (limit = 20) => {
    return await get('/media/tags', { limit })
  },

  // Search media
  searchMedia: async (query, params = {}) => {
    return await get('/media/search', { q: query, ...params })
  }
}

export default mediaService
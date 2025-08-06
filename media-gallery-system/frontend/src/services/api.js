import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
const getToken = () => {
  return localStorage.getItem('token');
};

const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Set token from localStorage on app start
const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Handle different error status codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      setToken(null);
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.');
    } else {
      // Don't show toast for validation errors - let components handle them
      if (error.response?.status !== 400) {
        toast.error(message);
      }
    }
    
    return Promise.reject(error);
  }
);

// API wrapper with error handling
const apiRequest = async (method, url, data = null, options = {}) => {
  try {
    const config = {
      method,
      url,
      ...options,
    };

    if (data) {
      if (method.toLowerCase() === 'get') {
        config.params = data;
      } else {
        config.data = data;
      }
    }

    const response = await api(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// HTTP methods
export const get = (url, params, options) => apiRequest('get', url, params, options);
export const post = (url, data, options) => apiRequest('post', url, data, options);
export const put = (url, data, options) => apiRequest('put', url, data, options);
export const patch = (url, data, options) => apiRequest('patch', url, data, options);
export const del = (url, data, options) => apiRequest('delete', url, data, options);

// File upload helper
export const uploadFile = async (url, formData, onProgress) => {
  try {
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      } : undefined,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// File download helper
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename || 'download';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { api, setToken, getToken };
export default api;
import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://192.168.25.54:3001/api',
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      code: error.response?.data?.code
    });

    // Transform error for consistent handling
    const transformedError = {
      message: error.response?.data?.error || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details
    };

    return Promise.reject(transformedError);
  }
);

/**
 * Upload an image file for QR code processing
 * @param {File} file - Image file to upload
 * @returns {Promise} Response with upload data
 */
export const uploadImage = async (file) => {
  try {
    // Validate file before upload
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${Math.floor(maxSize / 1024 / 1024)}MB`);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image');
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('image', file);

    // Upload with progress tracking
    const response = await api.post('/upload', formData, {
      headers: {
        // Don't set Content-Type - let axios set it with boundary
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📤 Upload Progress: ${percentCompleted}%`);
        }
      },
    });

    return response;
  } catch (error) {
    // Add context to upload errors
    throw new Error(JSON.stringify({
      ...error,
      context: 'upload',
      fileName: file?.name,
      fileSize: file?.size
    }));
  }
};

/**
 * Get processing results for an upload
 * @param {string} uploadId - Upload ID to get results for
 * @returns {Promise} Response with results data
 */
export const getResults = async (uploadId) => {
  try {
    if (!uploadId) {
      throw new Error('Upload ID is required');
    }

    const response = await api.get(`/results/${uploadId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    throw new Error(JSON.stringify({
      ...error,
      context: 'getResults',
      uploadId
    }));
  }
};

/**
 * Get upload history (optional feature)
 * @param {Object} params - Query parameters
 * @returns {Promise} Response with uploads list
 */
export const getUploads = async (params = {}) => {
  try {
    const { limit = 50, offset = 0 } = params;
    
    const response = await api.get('/uploads', {
      params: { limit, offset },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response;
  } catch (error) {
    throw new Error(JSON.stringify({
      ...error,
      context: 'getUploads'
    }));
  }
};

/**
 * Delete an upload and its associated files
 * @param {string} uploadId - Upload ID to delete
 * @returns {Promise} Response confirming deletion
 */
export const deleteUpload = async (uploadId) => {
  try {
    if (!uploadId) {
      throw new Error('Upload ID is required');
    }

    const response = await api.delete(`/uploads/${uploadId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    throw new Error(JSON.stringify({
      ...error,
      context: 'deleteUpload',
      uploadId
    }));
  }
};

/**
 * Check API health status
 * @returns {Promise} Response with health data
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error) {
    throw new Error(JSON.stringify({
      ...error,
      context: 'health'
    }));
  }
};

/**
 * Utility function to get error message from API error
 * @param {Object} error - Error object from API
 * @returns {string} Human-readable error message
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  // Handle different error structures
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.message) {
    return error.message;
  }

  // Fallback for network errors
  if (error.code === 'NETWORK_ERROR' || !error.status) {
    return 'Network error. Please check your connection and try again.';
  }

  // Handle specific HTTP status codes
  switch (error.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required.';
    case 403:
      return 'Access denied.';
    case 404:
      return 'Resource not found.';
    case 413:
      return 'File too large. Please upload a smaller image.';
    case 429:
      return 'Too many requests. Please wait and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Utility function to check if error is retryable
 * @param {Object} error - Error object from API
 * @returns {boolean} Whether the error is retryable
 */
export const isRetryableError = (error) => {
  // Network errors are generally retryable
  if (error.code === 'NETWORK_ERROR' || !error.status) {
    return true;
  }

  // 5xx server errors are retryable
  if (error.status >= 500) {
    return true;
  }

  // 429 rate limit is retryable after delay
  if (error.status === 429) {
    return true;
  }

  // Most 4xx errors are not retryable (client errors)
  return false;
};

export default api;
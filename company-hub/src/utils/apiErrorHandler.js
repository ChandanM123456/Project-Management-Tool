// Global API error handler utility
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          type: 'error',
          message: data.message || 'Bad request. Please check your input.',
          details: data
        };
      
      case 401:
        return {
          type: 'error',
          message: 'Authentication failed. Please log in again.',
          action: 'redirect_to_login'
        };
      
      case 403:
        return {
          type: 'error',
          message: 'Access denied. You do not have permission to perform this action.',
          details: data
        };
      
      case 404:
        return {
          type: 'error',
          message: 'Resource not found.',
          details: data
        };
      
      case 422:
        return {
          type: 'error',
          message: 'Validation error. Please check your input.',
          details: data.errors || data
        };
      
      case 500:
        return {
          type: 'error',
          message: 'Server error. Please try again later.',
          details: data
        };
      
      default:
        return {
          type: 'error',
          message: `Request failed with status ${status}.`,
          details: data
        };
    }
  } else if (error.request) {
    // The request was made but no response was received
    return {
      type: 'error',
      message: 'Network error. Please check your internet connection.',
      details: error.request
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      type: 'error',
      message: 'An unexpected error occurred.',
      details: error.message
    };
  }
};

// Success response handler
export const handleApiSuccess = (response) => {
  return {
    type: 'success',
    message: response.data.message || 'Operation completed successfully.',
    data: response.data
  };
};

// Loading state utility
export const createLoadingState = (initialLoading = false) => {
  let isLoading = initialLoading;
  let loadingMessage = '';
  
  return {
    setLoading: (loading, message = '') => {
      isLoading = loading;
      loadingMessage = message;
    },
    getLoading: () => ({ isLoading, loadingMessage })
  };
};

// Retry utility for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await requestFn();
      return response;
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        // Wait before retrying (with exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

// Request timeout utility
export const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
};

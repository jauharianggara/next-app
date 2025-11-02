import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Use proxy for development to avoid CORS issues, direct API for production
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: check if we should use proxy
    const useProxy = process.env.NEXT_PUBLIC_USE_PROXY === 'true';
    return useProxy 
      ? '/api/proxy'
      : (process.env.NEXT_PUBLIC_API_URL || 'https://axum.synergyinfinity.id/');
  }
  // Server-side: use direct API URL
  return process.env.NEXT_PUBLIC_API_URL || 'https://axum.synergyinfinity.id/';
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CSRF cookies
});

// Request interceptor to add auth token and CSRF token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token if available
    const csrfToken = Cookies.get('XSRF-TOKEN') || Cookies.get('csrf_token');
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      Cookies.remove('auth_token');
      window.location.href = '/auth/login';
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);
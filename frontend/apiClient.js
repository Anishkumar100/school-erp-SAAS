// src/apiClient.js

import axios from 'axios';
import { baseUrl } from './environment'; // Import your baseUrl

// Create a configured instance of axios
const apiClient = axios.create({
  baseURL: baseUrl,
});

// Use an interceptor to add the token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // If the token exists, add it to the Authorization header
      // This "Bearer " prefix is a standard convention
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export the configured client
export default apiClient;
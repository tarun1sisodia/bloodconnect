import api from './api.js';

// Local storage keys
const TOKEN_KEY = 'bloodconnect_token';
const USER_KEY = 'bloodconnect_user';

/**
 * Authentication service for handling user authentication
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - The response data
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise} - The response data
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  /**
   * Get the current user from local storage
   * @returns {Object|null} - The current user or null if not logged in
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  /**
   * Get the authentication token from local storage
   * @returns {string|null} - The authentication token or null if not logged in
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  /**
   * Check if a user is logged in
   * @returns {boolean} - True if a user is logged in, false otherwise
   */
  isLoggedIn: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
  
  /**
   * Update the current user in local storage
   * @param {Object} userData - Updated user data
   */
  updateCurrentUser: (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }
};

export default authService;

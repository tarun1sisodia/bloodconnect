// Configuration settings for BloodConnect frontend

// API configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    USERS: {
      ALL: '/users',
      ME: '/users/me',
      BY_ID: (id) => `/users/${id}`,
      DONORS: '/users/donors'
    },
    REQUESTS: {
      ALL: '/requests',
      BY_ID: (id) => `/requests/${id}`,
      BY_USER: (userId) => `/requests/user/${userId}`
    },
    DONATIONS: {
      ALL: '/donations',
      BY_ID: (id) => `/donations/${id}`,
      USER: '/donations/user'
    },
    MATCH: {
      FIND_DONORS: (requestId) => `/match/${requestId}`,
      VOLUNTEER: (requestId) => `/match/volunteer/${requestId}`
    },
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      RESET_PASSWORD: '/auth/reset-password'
    }
  }
};

// Supabase configuration
export const SUPABASE_CONFIG = {
  URL: 'https://oecqcmjebnxpifseenqw.supabase.co',
  KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lY3FjbWplYm54cGlmc2VlbnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTY1MzMsImV4cCI6MjA1OTE3MjUzM30.5I28RNbWJpdsaJgBtdCLyYOXl432qSBqRklRAyU9n6A'
};

// Initialize configuration
export async function initializeConfig() {
  try {
    // Try to fetch configuration from backend
    const response = await fetch(`${API_CONFIG.BASE_URL}/config`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch configuration');
    }
    
    const config = await response.json();
    
    // Update configuration with values from server
    if (config.apiBaseUrl) {
      API_CONFIG.BASE_URL = config.apiBaseUrl;
    }
    
    if (config.supabaseUrl) {
      SUPABASE_CONFIG.URL = config.supabaseUrl;
    }
    
    if (config.supabaseKey) {
      SUPABASE_CONFIG.KEY = config.supabaseKey;
    }
    
    console.log('Configuration initialized from server');
    return true;
  } catch (error) {
    console.warn('Using default configuration:', error.message);
    return false;
  }
}

// Export API base URL for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const SUPABASE_URL = SUPABASE_CONFIG.URL;
export const SUPABASE_KEY = SUPABASE_CONFIG.KEY;

// Configuration for the frontend application

// API configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      RESET_PASSWORD: '/auth/reset-password',
      ME: '/auth/me'
    },
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
      BY_ID: (id) => `/donations/${id}`
    },
    MATCH: {
      FIND_DONORS: (requestId) => `/match/${requestId}`,
      VOLUNTEER: (requestId) => `/match/volunteer/${requestId}`
    }
  }
};

// Supabase configuration
export const SUPABASE_CONFIG = {
  URL: '',
  KEY: ''
};

// Initialize configuration
export const initializeConfig = async () => {
  try {
    // Fetch configuration from backend
    const response = await fetch(`${API_CONFIG.BASE_URL}/config`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch configuration');
    }
    
    const config = await response.json();
    
    // Update Supabase configuration
    SUPABASE_CONFIG.URL = config.supabaseUrl;
    SUPABASE_CONFIG.KEY = config.supabaseKey;
    
    console.log('Configuration initialized successfully');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize configuration:', error);
    
    // Fallback to hardcoded values if config endpoint fails
    SUPABASE_CONFIG.URL = 'https://pawrycdrdfjevknjqkhn.supabase.co';
    SUPABASE_CONFIG.KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhd3J5Y2RyZGZqZXZrbmpxa2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzEwOTQsImV4cCI6MjA1OTQ0NzA5NH0.R0Qpg3ojscr4E0SnvSBpoCxZDjWv-aU0xloH3260LpU';
    
    return false;
  }
};

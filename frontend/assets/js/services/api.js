import { API_CONFIG } from '../config.js';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ msg: 'Something went wrong' }));
    throw new Error(error.msg || `API request failed with status ${response.status}`);
  }
  
  return response.json();
};

// Users API
export const usersAPI = {
  // Get all donors
  getDonors: () => apiRequest(API_CONFIG.ENDPOINTS.USERS.DONORS),
  
  // Get user by ID
  getUser: (id) => apiRequest(API_CONFIG.ENDPOINTS.USERS.BY_ID(id)),
  
  // Get current user profile
  getProfile: () => apiRequest(API_CONFIG.ENDPOINTS.USERS.ME),
  
  // Update user profile
  updateProfile: (userData) => apiRequest(API_CONFIG.ENDPOINTS.USERS.ME, {
    method: 'PUT',
    body: JSON.stringify(userData)
  })
};

// Requests API
export const requestsAPI = {
  // Create a new blood request
  createRequest: (requestData) => apiRequest(API_CONFIG.ENDPOINTS.REQUESTS.ALL, {
    method: 'POST',
    body: JSON.stringify(requestData)
  }),
  
  // Get all blood requests
  getRequests: () => apiRequest(API_CONFIG.ENDPOINTS.REQUESTS.ALL),
  
  // Get blood request by ID
  getRequest: (id) => apiRequest(API_CONFIG.ENDPOINTS.REQUESTS.BY_ID(id)),
  
  // Get blood requests by current user
  getUserRequests: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return Promise.resolve([]);
    return apiRequest(API_CONFIG.ENDPOINTS.REQUESTS.BY_USER(user.id));
  },
  
  // Update blood request
  updateRequest: (id, requestData) => apiRequest(API_CONFIG.ENDPOINTS.REQUESTS.BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(requestData)
  })
};

// Match API
export const matchAPI = {
  // Find matching donors for a request
  findDonors: (requestId) => apiRequest(API_CONFIG.ENDPOINTS.MATCH.FIND_DONORS(requestId), {
    method: 'POST'
  }),
  
  // Volunteer to donate for a request
  volunteerToDonate: (requestId) => apiRequest(API_CONFIG.ENDPOINTS.MATCH.VOLUNTEER(requestId), {
    method: 'POST'
  })
};

// Donations API
export const donationsAPI = {
  // Record a new donation
  createDonation: (donationData) => apiRequest(API_CONFIG.ENDPOINTS.DONATIONS.ALL, {
    method: 'POST',
    body: JSON.stringify(donationData)
  }),
  
  // Get all donations by current user
  getUserDonations: () => apiRequest(API_CONFIG.ENDPOINTS.DONATIONS.USER),
  
  // Get donation by ID
  getDonation: (id) => apiRequest(API_CONFIG.ENDPOINTS.DONATIONS.BY_ID(id)),
  
  // Update donation
  updateDonation: (id, donationData) => apiRequest(API_CONFIG.ENDPOINTS.DONATIONS.BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(donationData)
  })
};

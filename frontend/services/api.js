/**
 * API service for making HTTP requests to the backend
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Handles the HTTP response and throws an error if the response is not ok
 * @param {Response} response - The fetch response object
 * @returns {Promise} - The response data
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = (data && data.msg) || response.statusText;
    throw new Error(error);
  }
  
  return data;
};

/**
 * Makes a GET request to the specified endpoint
 * @param {string} endpoint - The API endpoint
 * @param {string} token - The authentication token (optional)
 * @returns {Promise} - The response data
 */
export const get = async (endpoint, token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers
  });
  
  return handleResponse(response);
};

/**
 * Makes a POST request to the specified endpoint
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @param {string} token - The authentication token (optional)
 * @returns {Promise} - The response data
 */
export const post = async (endpoint, data, token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  
  return handleResponse(response);
};

/**
 * Makes a PUT request to the specified endpoint
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @param {string} token - The authentication token (optional)
 * @returns {Promise} - The response data
 */
export const put = async (endpoint, data, token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });
  
  return handleResponse(response);
};

/**
 * Makes a DELETE request to the specified endpoint
 * @param {string} endpoint - The API endpoint
 * @param {string} token - The authentication token (optional)
 * @returns {Promise} - The response data
 */
export const del = async (endpoint, token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers
  });
  
  return handleResponse(response);
};

export default {
  get,
  post,
  put,
  del
};

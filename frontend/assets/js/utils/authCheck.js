/**
 * Authentication utility to protect routes and manage auth state
 */

// Check if user is authenticated
function isAuthenticated() {
  const token = localStorage.getItem('bloodconnect_token');
  const user = localStorage.getItem('bloodconnect_user');
  return !!(token && user);
}

// Redirect unauthenticated users to login
function requireAuth() {
  if (!isAuthenticated()) {
    // Store the intended destination for redirect after login
    const currentPage = window.location.pathname;
    if (currentPage !== '/login.html' && currentPage !== '/register.html' && currentPage !== '/index.html') {
      localStorage.setItem('auth_redirect', currentPage);
    }
    
    // Redirect to login
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Update UI based on authentication state
function updateAuthUI() {
  const authLinks = document.querySelectorAll('.auth-links');
  const userLinks = document.querySelectorAll('.user-links');
  const userNameElements = document.querySelectorAll('.user-name');
  
  if (isAuthenticated()) {
    // User is logged in
    authLinks.forEach(el => el.classList.add('hidden'));
    userLinks.forEach(el => el.classList.remove('hidden'));
    
    // Get user data and update UI
    const userData = JSON.parse(localStorage.getItem('bloodconnect_user'));
    if (userData && userData.name) {
      userNameElements.forEach(el => {
        el.textContent = userData.name;
      });
    }
  } else {
    // User is not logged in
    authLinks.forEach(el => el.classList.remove('hidden'));
    userLinks.forEach(el => el.classList.add('hidden'));
  }
}

// Handle logout
function logout() {
  localStorage.removeItem('bloodconnect_token');
  localStorage.removeItem('bloodconnect_user');
  window.location.href = 'index.html';
}

export { isAuthenticated, requireAuth, updateAuthUI, logout };

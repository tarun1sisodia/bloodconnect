import { initializeConfig } from './config.js';
import authService from './services/auth.js';
import { usersAPI, requestsAPI, matchAPI, donationsAPI } from './services/api.js';
import { showSuccess, showError, showInfo, showWarning } from './utils/toast.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize configuration
    // Initialize configuration
    await initializeConfig();
  
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  
    // Mobile menu toggle functionality
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
      });
    }
  
    // Check if user is logged in
    await checkAuthStatus();
    
    // Initialize page-specific functionality
    initPage();
  });
  
  // Function to check authentication status
  async function checkAuthStatus() {
    try {
      const user = await authService.checkAuthStatus();
      
      if (user) {
        updateUIForLoggedInUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  }
  
  // Function to update UI for logged in user
  function updateUIForLoggedInUser(user) {
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const registerLinks = document.querySelectorAll('a[href="register.html"]');
    
    loginLinks.forEach(link => {
      link.textContent = 'My Account';
      link.href = 'profile.html';
    });
    
    registerLinks.forEach(link => {
      link.textContent = 'Logout';
      link.href = '#';
      link.addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
      });
    });
  }
  
  // Function to handle logout
  async function handleLogout() {
    try {
      await authService.logout();
      
      showSuccess('Logged out successfully');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } catch (error) {
      console.error('Logout error:', error);
      showError('Logout failed. Please try again.');
    }
  }
  
  // Function to initialize the page based on the current URL
  function initPage() {
    const path = window.location.pathname;
    
    // Check if on profile page
    if (path.includes('profile.html')) {
      loadUserProfile();
    }
    
    // Check if on request details page
    if (path.includes('request-details.html')) {
      loadRequestDetails();
    }
    
    // Check if on emergency request page
    if (path.includes('emergency.html')) {
      initEmergencyRequestPage();
    }
    
    // Check if on donors page
    if (path.includes('donors.html')) {
      loadDonors();
    }
    
    // Check if on requests page
    if (path.includes('requests.html')) {
      loadBloodRequests();
    }
    
    // Setup form submission handlers
    setupFormHandlers();
    
    // Setup blood type selector
    setupBloodTypeSelector();
    
    // Animate statistics on homepage
    if (path === '/' || path.includes('index.html')) {
      animateStatistics();
    }
  }
  
  // Function to setup form submission handlers
  function setupFormHandlers() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formId = form.id || form.getAttribute('data-form-type');
        
        switch (formId) {
          case 'loginForm':
            handleLogin(form);
            break;
          case 'registerForm':
            handleRegistration(form);
            break;
          case 'contactForm':
            handleContactMessage(form);
            break;
          case 'emergencyForm':
            handleEmergencyRequest(form);
            break;
          case 'requestForm':
            handleBloodRequest(form);
            break;
          case 'profileForm':
            handleProfileUpdate(form);
            break;
        }
      });
    });
  }
  
  // Function to handle login form submission
  async function handleLogin(form) {
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    
    try {
      await authService.login(email, password);
      
      showSuccess('Login successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      showError(error.message || 'Login failed. Please try again.');
    }
  }
  
  // Function to handle registration form submission
  async function handleRegistration(form) {
    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    const bloodType = form.querySelector('#bloodType').value;
    const location = form.querySelector('#location').value;
    const phone = form.querySelector('#phone').value;
    const isDonor = form.querySelector('#isDonor').checked;
    
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    try {
      await authService.register({
        name,
        email,
        password,
        bloodType,
        location,
        phone,
        isDonor
      });
      
      showSuccess('Registration successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      showError(error.message || 'Registration failed. Please try again.');
    }
  }
  
  // Function to load blood requests
  async function loadBloodRequests() {
    const requestsContainer = document.getElementById('requestsContainer');
    
    if (!requestsContainer) return;
    
    try {
      const requests = await requestsAPI.getRequests();
      
      if (requests.length === 0) {
        requestsContainer.innerHTML = '<p class="text-center text-gray-500">No blood requests available at the moment.</p>';
        return;
      }
      
      let html = '';
      requests.forEach(request => {
        const urgencyClass = 
          request.urgency === 'emergency' ? 'bg-red-600' : 
          request.urgency === 'high' ? 'bg-orange-500' : 
          request.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
        
        html += `
          <div class="bg-white rounded-lg shadow-md p-6 mb-4">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-semibold">${request.patientName}</h3>
                <p class="text-gray-600">Hospital: ${request.hospital}</p>
                <p class="text-gray-600">Location: ${request.location}</p>
              </div>
              <div class="flex items-center">
                <span class="font-bold text-2xl mr-2">${request.bloodType}</span>
                <span class="${urgencyClass} text-white text-xs px-2 py-1 rounded-full">${request.urgency}</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-gray-700">Units needed: ${request.units}</p>
              <a href="request-details.html?id=${request._id}" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md">View Details</a>
            </div>
          </div>
        `;
      });
      
      requestsContainer.innerHTML = html;
    } catch (error) {
      console.error('Error loading blood requests:', error);
      requestsContainer.innerHTML = '<p class="text-center text-red-500">Error loading blood requests. Please try again later.</p>';
    }
  }
  
  // Function to load donors
  async function loadDonors() {
    const donorsContainer = document.getElementById('donorsContainer');
    
    if (!donorsContainer) return;
    
    try {
      const users = await usersAPI.getDonors();
      
      if (users.length === 0) {
        donorsContainer.innerHTML = '<p class="text-center text-gray-500">No donors available at the moment.</p>';
        return;
      }
      
      let html = '';
      users.forEach(donor => {
        html += `
          <div class="bg-white rounded-lg shadow-md p-6 mb-4">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-semibold">${donor.name}</h3>
                <p class="text-gray-600">Location: ${donor.location}</p>
              </div>
              <div>
                <span class="font-bold text-2xl">${donor.bloodType}</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <p class="text-gray-700">Last donation: ${donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'N/A'}</p>
              <button class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md contact-donor" data-donor-id="${donor._id}">Contact Donor</button>
            </div>
          </div>
        `;
      });
      
      donorsContainer.innerHTML = html;
      
      // Add event listeners to contact donor buttons
      document.querySelectorAll('.contact-donor').forEach(button => {
        button.addEventListener('click', function() {
          const donorId = this.getAttribute('data-donor-id');
          contactDonor(donorId);
        });
      });
    } catch (error) {
      console.error('Error loading donors:', error);
      donorsContainer.innerHTML = '<p class="text-center text-red-500">Error loading donors. Please try again later.</p>';
    }
  }
  
  // Function to animate statistics counters on the homepage
  function animateStatistics() {
    const statsElements = document.querySelectorAll('.stat-counter');
    
    statsElements.forEach(element => {
      const target = parseInt(element.getAttribute('data-target') || '0');
      const duration = 2000; // 2 seconds
      const step = Math.ceil(target / (duration / 30)); // Update roughly 30 times per second
      let current = 0;
      
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          clearInterval(timer);
          current = target;
        }
        element.textContent = current;
      }, duration / (target / step));
    });
  }
  
  // Function to set up blood type selector
  function setupBloodTypeSelector() {
    const bloodTypeSelector = document.getElementById('bloodTypeSelector');
    
    if (bloodTypeSelector) {
      bloodTypeSelector.addEventListener('change', function() {
        const selectedBloodType = this.value;
        
        // Filter donors or requests based on blood type
        if (window.location.pathname.includes('donors.html')) {
          filterDonorsByBloodType(selectedBloodType);
        } else if (window.location.pathname.includes('requests.html')) {
          filterRequestsByBloodType(selectedBloodType);
        }
      });
    }
  }
  
  // Export functions and services for use in inline scripts
  window.bloodConnect = {
    auth: authService,
    api: {
      users: usersAPI,
      requests: requestsAPI,
      match: matchAPI,
      donations: donationsAPI
    },
    ui: {
      showSuccess,
      showError,
      showInfo,
      showWarning
    },
    handlers: {
      handleLogin,
      handleRegistration,
      handleLogout
    }
  };
  
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_CONFIG, API_CONFIG } from '../config.js';
import { showSuccess, showError } from '../utils/toast.js';

// Initialize Supabase client
let supabase = null;

async function getSupabase() {
  if (supabase) return supabase;
  
  try {
    supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.KEY);
    return supabase;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    throw error;
  }
}

// Auth service for handling authentication
const authService = {
  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },
  
  // Get current user from localStorage
  getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },
  
  // Login user
  async login(email, password) {
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Store token in localStorage
      localStorage.setItem('token', data.session.access_token);
      
      // Get user data from backend
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.ME}`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } catch (backendError) {
        console.error('Error fetching user data from backend:', backendError);
        // If backend fails, use Supabase user data
        const userData = {
          supabaseId: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email.split('@')[0],
          bloodType: data.user.user_metadata?.bloodType || 'Unknown',
          location: data.user.user_metadata?.location || '',
          phone: data.user.user_metadata?.phone || '',
          isDonor: data.user.user_metadata?.isDonor || false
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register user
  async register(userData) {
    try {
      const { email, password, ...profileData } = userData;
      
      // Register with Supabase
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: profileData
        }
      });
      
      if (error) throw error;
      
      // If registration successful and session available (email confirmation not required)
      if (data.session) {
        localStorage.setItem('token', data.session.access_token);
        
        // Create user in backend
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`
            },
            body: JSON.stringify({
              email,
              ...profileData
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to create user in backend');
          }
          
          const backendData = await response.json();
          localStorage.setItem('user', JSON.stringify(backendData.user));
          return backendData.user;
        } catch (backendError) {
          console.error('Error creating user in backend:', backendError);
          // If backend fails, use Supabase user data
          const userData = {
            supabaseId: data.user.id,
            email: data.user.email,
            ...profileData
          };
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        }
      }
      
      // If email confirmation required
      return {
        message: 'Registration successful. Please check your email to confirm your account.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Logout user
  async logout() {
    try {
      const sb = await getSupabase();
      const { error } = await sb.auth.signOut();
      
      if (error) throw error;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Remove local storage items even if Supabase logout fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },
  
  // Reset password
  async resetPassword(email) {
    try {
      const sb = await getSupabase();
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`,
      });
      
      if (error) throw error;
      
      return { message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
  
  // Change password
  async changePassword(newPassword) {
    try {
      const sb = await getSupabase();
      const { error } = await sb.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return { message: 'Password changed successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  },
  
  // Check auth status
  async checkAuthStatus() {
    try {
      const sb = await getSupabase();
      const { data: { session }, error } = await sb.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        localStorage.setItem('token', session.access_token);
        
        // Get user data from backend
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.ME}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          const userData = await response.json();
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        } catch (backendError) {
          console.error('Error fetching user data from backend:', backendError);
          // If backend fails, use session user
          return session.user;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }
};

export default authService;

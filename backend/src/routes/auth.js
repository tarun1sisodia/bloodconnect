import express from 'express';
import User from '../models/User.js';
import supabase from '../utils/supabase.js';
import { validateUserRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register user with Supabase and MongoDB
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, bloodType, location, phone, isDonor } = req.body;

    // Check if user already exists in MongoDB
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Register user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          bloodType,
          location,
          phone,
          isDonor
        }
      }
    });

    if (authError) {
      return res.status(400).json({ msg: authError.message });
    }

    // Create user in MongoDB
    user = new User({
      supabaseId: authData.user.id,
      name,
      email,
      bloodType,
      location,
      phone,
      isDonor
    });

    await user.save();

    // Return the token from Supabase
    res.json({ 
      token: authData.session?.access_token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodType: user.bloodType,
        location: user.location,
        isDonor: user.isDonor
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Login user with Supabase
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Login with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ msg: authError.message });
    }

    // Get user from MongoDB
    const user = await User.findOne({ email });

    // If user doesn't exist in MongoDB but exists in Supabase, create it
    if (!user && authData.user) {
      const newUser = new User({
        supabaseId: authData.user.id,
        name: authData.user.user_metadata.name || email.split('@')[0],
        email,
        bloodType: authData.user.user_metadata.bloodType || 'Unknown',
        location: authData.user.user_metadata.location || '',
        phone: authData.user.user_metadata.phone || '',
        isDonor: authData.user.user_metadata.isDonor || false
      });

      await newUser.save();
      
      return res.json({ 
        token: authData.session.access_token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          bloodType: newUser.bloodType,
          location: newUser.location,
          isDonor: newUser.isDonor
        }
      });
    }

    // Return the token and user data
    res.json({ 
      token: authData.session.access_token,
      user: user ? {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodType: user.bloodType,
        location: user.location,
        isDonor: user.isDonor
      } : null
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/reset-password
// @desc    Send password reset email via Supabase
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Send password reset email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8081/reset-password.html',
    });

    if (error) {
      return res.status(400).json({ msg: error.message });
    }

    res.json({ msg: 'Password reset email sent' });
  } catch (err) {
    console.error('Password reset error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // This route would normally use the auth middleware
    // For now, we'll just return a placeholder response
    res.json({ msg: 'Auth route working' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Export the router with default export
export default router;

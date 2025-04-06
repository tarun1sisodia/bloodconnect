const express = require('express');
const User = require('../models/User');
const supabase = require('../config/supabase');
const { validateUserRegistration, validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { sendTemplatedEmail } = require('../utils/emailSender');

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

    // Send welcome email
    try {
        await sendTemplatedEmail(email, 'welcome', { name });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with registration even if email fails
    }

    // Return the token from Supabase
    res.json({ 
      token: authData.session?.access_token,
      user: {
        id: user._id,
        supabaseId: user.supabaseId,
        name: user.name,
        email: user.email,
        bloodType: user.bloodType,
        location: user.location,
        phone: user.phone,
        isDonor: user.isDonor
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Server error' });
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
        name: authData.user.user_metadata?.name || email.split('@')[0],
        email,
        bloodType: authData.user.user_metadata?.bloodType || 'Unknown',
        location: authData.user.user_metadata?.location || '',
        phone: authData.user.user_metadata?.phone || '',
        isDonor: authData.user.user_metadata?.isDonor || false
      });

      await newUser.save();
      
      return res.json({ 
        token: authData.session.access_token,
        user: {
          id: newUser._id,
          supabaseId: newUser.supabaseId,
          name: newUser.name,
          email: newUser.email,
          bloodType: newUser.bloodType,
          location: newUser.location,
          phone: newUser.phone,
          isDonor: newUser.isDonor
        }
      });
    }

    // Return the token and user data
    res.json({ 
      token: authData.session.access_token,
      user: user ? {
        id: user._id,
        supabaseId: user.supabaseId,
        name: user.name,
        email: user.email,
        bloodType: user.bloodType,
        location: user.location,
        phone: user.phone,
        isDonor: user.isDonor
      } : null
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error' });
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
      redirectTo: process.env.FRONTEND_URL + '/reset-password.html',
    });

    if (error) {
      return res.status(400).json({ msg: error.message });
    }

    res.json({ msg: 'Password reset email sent' });
  } catch (err) {
    console.error('Password reset error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({
      id: user._id,
      supabaseId: user.supabaseId,
      name: user.name,
      email: user.email,
      bloodType: user.bloodType,
      location: user.location,
      phone: user.phone,
      isDonor: user.isDonor,
      lastDonationDate: user.lastDonationDate
    });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

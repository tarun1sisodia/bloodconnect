import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { validateProfileUpdate } from '../middleware/validation.js';
import supabase from '../utils/supabase.js';

const router = express.Router();

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', [auth, validateProfileUpdate], async (req, res) => {
  try {
    const { name, bloodType, location, phone, isDonor, lastDonationDate } = req.body;
    
    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (bloodType) userFields.bloodType = bloodType;
    if (location) userFields.location = location;
    if (phone) userFields.phone = phone;
    if (isDonor !== undefined) userFields.isDonor = isDonor;
    if (lastDonationDate) userFields.lastDonationDate = lastDonationDate;
    
    // Update user in MongoDB
    let user = await User.findOneAndUpdate(
      { supabaseId: req.user.id },
      { $set: userFields },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update user metadata in Supabase
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
      user_metadata: {
        name,
        bloodType,
        location,
        phone,
        isDonor
      }
    });
    
    if (error) {
      console.error('Error updating Supabase user:', error.message);
      // Continue anyway since MongoDB was updated successfully
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error updating user profile:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/donors
// @desc    Get all donors
// @access  Public
router.get('/donors', async (req, res) => {
  try {
    const donors = await User.find({ isDonor: true })
      .select('-__v')
      .sort({ lastDonationDate: -1 });
    
    res.json(donors);
  } catch (err) {
    console.error('Error fetching donors:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.status(500).send('Server error');
  }
});

export default router;

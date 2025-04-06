const supabase = require('../config/supabase');
const User = require('../models/User');

// Authenticate user with Supabase token
exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Ensure user exists in MongoDB
exports.ensureUserInMongoDB = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Check if user exists in MongoDB
    let user = await User.findOne({ supabaseId: req.user.id });

    if (!user) {
      // Get user data from Supabase
      const { data: { user: supabaseUser }, error } = await supabase.auth.admin.getUserById(req.user.id);

      if (error || !supabaseUser) {
        return res.status(404).json({ msg: 'User not found in Supabase' });
      }

      // Create user in MongoDB
      user = new User({
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
        bloodType: supabaseUser.user_metadata?.bloodType || 'Unknown',
        location: supabaseUser.user_metadata?.location || '',
        phone: supabaseUser.user_metadata?.phone || '',
        isDonor: supabaseUser.user_metadata?.isDonor || false
      });

      await user.save();
    }

    // Add MongoDB user to request
    req.mongoUser = user;

    next();
  } catch (err) {
    console.error('Ensure user middleware error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

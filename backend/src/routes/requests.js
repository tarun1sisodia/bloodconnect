import express from 'express';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { validateBloodRequest } from '../middleware/validation.js';
import { sendTemplatedEmail, emailTemplates } from '../utils/emailSender.js';

const router = express.Router();

// @route   POST api/requests
// @desc    Create a new blood request
// @access  Private
router.post('/', [auth, validateBloodRequest], async (req, res) => {
  try {
    const { patientName, bloodType, units, hospital, location, urgency, notes } = req.body;
    
    // Get user from MongoDB
    const user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Create new request
    const newRequest = new Request({
      requesterId: user._id,
      patientName,
      bloodType,
      units,
      hospital,
      location,
      urgency: urgency || 'medium',
      notes
    });
    
    const request = await newRequest.save();
    
    // If it's an emergency request, find and notify potential donors
    if (urgency === 'emergency') {
      // Find compatible donors in the same location
      const compatibleBloodTypes = request.getCompatibleDonorBloodTypes();
      
      const potentialDonors = await User.find({
        isDonor: true,
        bloodType: { $in: compatibleBloodTypes },
        location: { $regex: new RegExp(location, 'i') }
      });
      
      // Send email notifications to potential donors
      if (potentialDonors.length > 0) {
        const emailPromises = potentialDonors.map(donor => {
          return sendTemplatedEmail(
            donor.email,
            emailTemplates.donorMatch,
            {
              donorName: donor.name,
              patientName,
              bloodType,
              hospital,
              location
            }
          );
        });
        
        // Don't wait for emails to be sent
        Promise.all(emailPromises).catch(error => {
          console.error('Error sending emergency request emails:', error);
        });
      }
    }
    
    res.status(201).json(request);
  } catch (err) {
    console.error('Error creating blood request:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/requests
// @desc    Get all blood requests
// @access  Public
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('requesterId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error('Error fetching blood requests:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/requests/:id
// @desc    Get blood request by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requesterId', 'name email phone')
      .populate('matchedDonors', 'name bloodType location phone email');
    
    if (!request) {
      return res.status(404).json({ msg: 'Blood request not found' });
    }
    
    res.json(request);
  } catch (err) {
    console.error('Error fetching blood request:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blood request not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   PUT api/requests/:id
// @desc    Update blood request
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ msg: 'Blood request not found' });
    }
    
    // Get user from MongoDB
    const user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if user is the requester
    if (request.requesterId.toString() !== user._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized to update this request' });
    }
    
    // Update fields
    const { patientName, bloodType, units, hospital, location, urgency, notes, status } = req.body;
    
    if (patientName) request.patientName = patientName;
    if (bloodType) request.bloodType = bloodType;
    if (units) request.units = units;
    if (hospital) request.hospital = hospital;
    if (location) request.location = location;
    if (urgency) request.urgency = urgency;
    if (notes) request.notes = notes;
    if (status) request.status = status;
    
    const updatedRequest = await request.save();
    
    res.json(updatedRequest);
  } catch (err) {
    console.error('Error updating blood request:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blood request not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   GET api/requests/user/:userId
// @desc    Get blood requests by user ID
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const requests = await Request.find({ requesterId: req.params.userId })
      .populate('requesterId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error('Error fetching user blood requests:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/requests/:id
// @desc    Delete a blood request
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ msg: 'Blood request not found' });
    }
    
    // Get user from MongoDB
    const user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if user is the requester
    if (request.requesterId.toString() !== user._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized to delete this request' });
    }
    
    await request.remove();
    
    res.json({ msg: 'Blood request removed' });
  } catch (err) {
    console.error('Error deleting blood request:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blood request not found' });
    }
    
    res.status(500).send('Server error');
  }
});

export default router;

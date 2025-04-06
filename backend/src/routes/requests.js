const express = require('express');
const Request = require('../models/Request');
const { auth, ensureUserInMongoDB } = require('../middleware/auth');
const { validateBloodRequest } = require('../middleware/validation');

const router = express.Router();

// @route   POST api/requests
// @desc    Create a blood request
// @access  Private
router.post('/', [auth, ensureUserInMongoDB, validateBloodRequest], async (req, res) => {
  try {
    const { patientName, bloodType, units, hospital, location, urgency, notes } = req.body;
    
    // Create new request
    const newRequest = new Request({
      requesterId: req.mongoUser._id,
      patientName,
      bloodType,
      units,
      hospital,
      location,
      urgency: urgency || 'medium',
      notes
    });
    
    const request = await newRequest.save();
    
    // Populate requester info
    await request.populate('requesterId', 'name email phone');
    
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/requests
// @desc    Get all blood requests
// @access  Public
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find()
      .sort({ createdAt: -1 })
      .populate('requesterId', 'name email phone');
    
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/requests/:id
// @desc    Get request by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requesterId', 'name email phone')
      .populate('matchedDonors', 'name bloodType location phone');
    
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    res.json(request);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT api/requests/:id
// @desc    Update a request
// @access  Private
router.put('/:id', [auth, ensureUserInMongoDB], async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    // Check if user is the requester
    if (request.requesterId.toString() !== req.mongoUser._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized to update this request' });
    }
    
    // Update fields
    const { status, patientName, bloodType, units, hospital, location, urgency, notes } = req.body;
    
    if (status) request.status = status;
    if (patientName) request.patientName = patientName;
    if (bloodType) request.bloodType = bloodType;
    if (units) request.units = units;
    if (hospital) request.hospital = hospital;
    if (location) request.location = location;
    if (urgency) request.urgency = urgency;
    if (notes !== undefined) request.notes = notes;
    
    await request.save();
    
    res.json(request);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/requests/user/:userId
// @desc    Get requests by user ID
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const requests = await Request.find({ requesterId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('requesterId', 'name email phone');
    
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

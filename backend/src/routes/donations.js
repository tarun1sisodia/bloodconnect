import express from 'express';
import Donation from '../models/Donation.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { validateDonation } from '../middleware/validation.js';
import { sendTemplatedEmail, emailTemplates } from '../utils/emailSender.js';

const router = express.Router();

// @route   POST api/donations
// @desc    Record a new donation
// @access  Private
router.post('/', [auth, validateDonation], async (req, res) => {
  try {
    const { requestId, donationDate, hospital, units, notes } = req.body;
    
    // Get user from MongoDB
    const user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if user is a donor
    if (!user.isDonor) {
      return res.status(400).json({ msg: 'User is not registered as a donor' });
    }
    
    // Create new donation
    const newDonation = new Donation({
      donorId: user._id,
      donationDate,
      hospital,
      units,
      notes
    });
    
    // If requestId is provided, link the donation to a request
    if (requestId) {
      const request = await Request.findById(requestId);
      
      if (!request) {
        return res.status(404).json({ msg: 'Blood request not found' });
      }
      
      // Check if donor's blood type is compatible with the request
      const compatibleBloodTypes = request.getCompatibleDonorBloodTypes();
      if (!compatibleBloodTypes.includes(user.bloodType)) {
        return res.status(400).json({ msg: 'Blood type is not compatible with the request' });
      }
      
      newDonation.requestId = requestId;
      
      // Add donor to matched donors if not already there
      if (!request.matchedDonors.includes(user._id)) {
        request.matchedDonors.push(user._id);
      }
      
      // Get all donations for this request
      const existingDonations = await Donation.find({ requestId });
      const totalUnitsDonated = existingDonations.reduce((sum, donation) => sum + donation.units, 0) + units;
      
      // If total units donated meets or exceeds the requested units, mark as fulfilled
      if (totalUnitsDonated >= request.units) {
        request.status = 'fulfilled';
      } else if (request.status === 'pending') {
        request.status = 'matched';
      }
      
      await request.save();
      
      // Notify the requester
      const requester = await User.findById(request.requesterId);
      if (requester) {
        sendTemplatedEmail(
          requester.email,
          emailTemplates.donationRecorded,
          {
            requesterName: requester.name,
            donorName: user.name,
            patientName: request.patientName,
            units,
            hospital,
            donationDate: new Date(donationDate).toLocaleDateString()
          }
        ).catch(error => {
          console.error('Error sending donation notification email:', error);
        });
      }
    }
    
    const donation = await newDonation.save();
    
    // Update user's donation count and last donation date
    user.donationCount += 1;
    user.lastDonationDate = donationDate;
    await user.save();
    
    res.status(201).json(donation);
  } catch (err) {
    console.error('Error recording donation:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/donations
// @desc    Get all donations by current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get user from MongoDB
    const user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const donations = await Donation.find({ donorId: user._id })
      .populate('requestId', 'patientName bloodType hospital')
      .sort({ donationDate: -1 });
    
    res.json(donations);
  } catch (err) {
    console.error('Error fetching donations:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/donations/:id
// @desc    Get donation by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name email phone bloodType')
      .populate('requestId', 'patientName bloodType hospital location');
    
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    
    // Get user from MongoDB
    const user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if user is the donor or the requester
    const isOwner = donation.donorId._id.toString() === user._id.toString();
    let isRequester = false;
    
    if (donation.requestId) {
      const request = await Request.findById(donation.requestId);
      if (request) {
        isRequester = request.requesterId.toString() === user._id.toString();
      }
    }
    
    if (!isOwner && !isRequester) {
      return res.status(401).json({ msg: 'Not authorized to view this donation' });
    }
    
    res.json(donation);
  } catch (err) {
    console.error('Error fetching donation:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    
    res.status(500).send('Server error');
  }
});

export default router;

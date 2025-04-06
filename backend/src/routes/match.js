import express from 'express';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { sendTemplatedEmail, emailTemplates } from '../utils/emailSender.js';

const router = express.Router();

// @route   POST api/match/:requestId
// @desc    Find matching donors for a blood request
// @access  Private
router.post('/:requestId', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    
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
      return res.status(401).json({ msg: 'Not authorized to find matches for this request' });
    }
    
    // Get compatible blood types
    const compatibleBloodTypes = request.getCompatibleDonorBloodTypes();
    
    // Find eligible donors in the same location
    const potentialDonors = await User.find({
      isDonor: true,
      bloodType: { $in: compatibleBloodTypes },
      location: { $regex: new RegExp(request.location, 'i') }
    }).limit(20);
    
    // Send email notifications to potential donors
    if (potentialDonors.length > 0) {
      const emailPromises = potentialDonors.map(donor => {
        return sendTemplatedEmail(
          donor.email,
          emailTemplates.donorMatch,
          {
            donorName: donor.name,
            patientName: request.patientName,
            bloodType: request.bloodType,
            hospital: request.hospital,
            location: request.location
          }
        );
      });
      
      // Don't wait for emails to be sent
      Promise.all(emailPromises).catch(error => {
        console.error('Error sending match emails:', error);
      });
      
      // Add donors to matched donors list
      request.matchedDonors = [
        ...new Set([
          ...request.matchedDonors.map(id => id.toString()),
          ...potentialDonors.map(donor => donor._id.toString())
        ])
      ];
      
      // Update request status
      if (request.status === 'pending') {
        request.status = 'matched';
      }
      
      await request.save();
    }
    
    res.json({
      matchedDonors: potentialDonors,
      message: `Found ${potentialDonors.length} potential donors.`
    });
  } catch (err) {
    console.error('Error finding matching donors:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blood request not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST api/match/volunteer/:requestId
// @desc    Volunteer to donate for a request
// @access  Private
router.post('/volunteer/:requestId', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ msg: 'Blood request not found' });
    }
    
    // Get user from MongoDB
    const user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if user is a donor
    if (!user.isDonor) {
      return res.status(400).json({ msg: 'User is not registered as a donor' });
    }
    
    // Check if user's blood type is compatible
    const compatibleBloodTypes = request.getCompatibleDonorBloodTypes();
    if (!compatibleBloodTypes.includes(user.bloodType)) {
      return res.status(400).json({ msg: 'Your blood type is not compatible with this request' });
    }
    
    // Check if user is already in matched donors
    if (request.matchedDonors.includes(user._id)) {
      return res.status(400).json({ msg: 'You have already volunteered for this request' });
    }
    
    // Add user to matched donors
    request.matchedDonors.push(user._id);
    
    // Update request status if it's pending
    if (request.status === 'pending') {
      request.status = 'matched';
    }
    
    await request.save();
    
    // Notify the requester
    const requester = await User.findById(request.requesterId);
    if (requester) {
      sendTemplatedEmail(
        requester.email,
        emailTemplates.volunteerNotification,
        {
          requesterName: requester.name,
          donorName: user.name,
          patientName: request.patientName,
          bloodType: user.bloodType,
          phone: user.phone,
          email: user.email
        }
      ).catch(error => {
        console.error('Error sending volunteer notification email:', error);
      });
    }
    
    res.json({
      success: true,
      message: 'You have successfully volunteered for this blood request.'
    });
  } catch (err) {
    console.error('Error volunteering for donation:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blood request not found' });
    }
    
    res.status(500).send('Server error');
  }
});

export default router;

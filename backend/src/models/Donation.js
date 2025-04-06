import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  donationDate: {
    type: Date,
    required: true
  },
  hospital: {
    type: String,
    required: true
  },
  units: {
    type: Number,
    required: true,
    min: 1
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to update user's donation count
DonationSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(doc.donorId);
    
    if (user) {
      await user.updateDonationCount();
    }
    
    // If this donation is linked to a request, check if request is fulfilled
    if (doc.requestId) {
      const Request = mongoose.model('Request');
      const request = await Request.findById(doc.requestId);
      
      if (request) {
        // Get all donations for this request
        const donations = await mongoose.model('Donation').find({ requestId: doc.requestId });
        
        // Calculate total units donated
        const totalUnitsDonated = donations.reduce((sum, donation) => sum + donation.units, 0);
        
        // If total units donated meets or exceeds the requested units, mark as fulfilled
        if (totalUnitsDonated >= request.units && request.status !== 'fulfilled') {
          request.status = 'fulfilled';
          await request.save();
        }
      }
    }
  } catch (error) {
    console.error('Error in Donation post-save hook:', error);
  }
});

const Donation = mongoose.model('Donation', DonationSchema);

export default Donation;

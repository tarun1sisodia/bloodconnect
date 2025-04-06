import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  supabaseId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown'
  },
  location: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  isDonor: {
    type: Boolean,
    default: false
  },
  lastDonationDate: {
    type: Date
  },
  donationCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if user is eligible to donate
UserSchema.methods.isEligibleToDonate = function() {
  if (!this.isDonor) return false;
  
  // If no previous donation, they are eligible
  if (!this.lastDonationDate) return true;
  
  // Check if at least 56 days (8 weeks) have passed since last donation
  const lastDonation = new Date(this.lastDonationDate);
  const today = new Date();
  const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
  
  return daysSinceLastDonation >= 56;
};

// Method to get compatible blood types for receiving
UserSchema.methods.getCompatibleBloodTypesForReceiving = function() {
  const compatibilityMap = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  
  return compatibilityMap[this.bloodType] || [];
};

// Method to get compatible blood types for donating
UserSchema.methods.getCompatibleBloodTypesForDonating = function() {
  const compatibilityMap = {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['A+', 'B+', 'AB+', 'O+'],
    'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  };
  
  return compatibilityMap[this.bloodType] || [];
};


// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to update donation count
UserSchema.methods.updateDonationCount = function() {
  this.donationCount += 1;
  this.lastDonationDate = new Date();
  return this.save();
};

const User = mongoose.model('User', UserSchema);

export default User;

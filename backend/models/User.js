const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  mobileNumber: { 
    type: String, 
    required: true 
  },
  fatherName: { 
    type: String, 
    required: true 
  },
  fatherPhone: { 
    type: String,
    required: true
  },
  motherName: { 
    type: String,
    required: true
  },
  motherPhone: { 
    type: String,
    required: true
  },
  dateOfBirth: { 
    type: Date, 
    required: true 
  },
  gender: { 
    type: String, 
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  permanentAddress: { 
    type: String, 
    required: true 
  },
  aadhaarNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  aadhaarDocument: { 
    type: String,
    required: true
  },
  profilePicture: {
    type: String
  },
  fileMetadata: {
    aadhaarDocument: {
      originalName: String,
      uploadDate: Date,
      size: Number,
      mimetype: String
    },
    profilePicture: {
      originalName: String,
      uploadDate: Date,
      size: Number,
      mimetype: String
    }
  },
  role: { 
    type: String, 
    enum: ['tenant', 'admin'], 
    default: 'tenant' 
  },
  isApproved: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);
import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
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
    type: String
  },
  motherName: {
    type: String
  },
  motherPhone: {
    type: String
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
  aadhaarFile: {
    type: String
  },
  aadhaarFileData: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  profilePicture: {
    type: String
  },
  profilePictureData: {
    data: Buffer,
    contentType: String,
    filename: String
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

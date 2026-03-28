import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import { uploadToCloudinary } from '../../infra/cloudinary.js';

export const registerUser = async (req, res) => {
  try {
    const {
      fullName, email, password, mobileNumber,
      fatherName, fatherPhone, motherName, motherPhone,
      dateOfBirth, gender, permanentAddress, aadhaarNumber
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !mobileNumber || !aadhaarNumber) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { aadhaarNumber }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email or Aadhaar number already registered'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ─── Sequential Cloudinary Uploads ──────────────────────────────────────────
    let aadhaarFrontUrl = null;
    let aadhaarBackUrl = null;
    let profilePictureUrl = null;

    try {
      if (req.files) {
        // 1. Aadhaar Front
        if (req.files['aadhaarFront']?.[0]) {
          console.log('🚀 Step 1/3: Uploading Aadhaar Front photo...');
          const result = await uploadToCloudinary(req.files['aadhaarFront'][0].buffer, 'aadhaar_cards', req.files['aadhaarFront'][0].mimetype);
          aadhaarFrontUrl = result.secure_url;
          await new Promise(res => setTimeout(res, 2000)); // 2s breathing room
        }

        // 2. Aadhaar Back
        if (req.files['aadhaarBack']?.[0]) {
          console.log('🚀 Step 2/3: Uploading Aadhaar Back photo...');
          const result = await uploadToCloudinary(req.files['aadhaarBack'][0].buffer, 'aadhaar_cards', req.files['aadhaarBack'][0].mimetype);
          aadhaarBackUrl = result.secure_url;
          await new Promise(res => setTimeout(res, 2000)); // 2s breathing room
        }

        // 3. Profile Picture
        if (req.files['profilePicture']?.[0]) {
          console.log('🚀 Step 3/3: Uploading Profile Photo...');
          const result = await uploadToCloudinary(req.files['profilePicture'][0].buffer, 'profile_photos', req.files['profilePicture'][0].mimetype);
          profilePictureUrl = result.secure_url;
        }
        
        console.log('✅ Sequential file uploads completed successfully.');
      }
    } catch (uploadError) {
      console.error('❌ Sequential upload failed! Registration aborted:', uploadError.message);
      return res.status(500).json({ 
        error: 'Failed to upload documents due to a slow connection. Please try again with a better network.' 
      });
    }

    const newUser = new User({
      fullName, email, password: hashedPassword, mobileNumber,
      fatherName, fatherPhone, motherName, motherPhone,
      dateOfBirth, gender, permanentAddress, aadhaarNumber,
      aadhaarFront: aadhaarFrontUrl,
      aadhaarBack: aadhaarBackUrl,
      profilePicture: profilePictureUrl,
      role: 'tenant',
      isApproved: false
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.'
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

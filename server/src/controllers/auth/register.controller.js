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

    // ─── Sequential Cloudinary Uploads (Strict Mode) ──────────────────────────
    let aadhaarFrontUrl = null;
    let aadhaarBackUrl = null;
    let profilePictureUrl = null;

    try {
      if (req.files) {
        // 1. Aadhaar Front
        if (req.files['aadhaarFront']?.[0]) {
          console.log('[Auth] Step 1/3: Aadhaar Front...');
          const result = await uploadToCloudinary(req.files['aadhaarFront'][0].buffer, 'aadhaar_cards', req.files['aadhaarFront'][0].mimetype);
          if (result.secure_url === "upload_failed") throw new Error('Aadhaar Front upload failed');
          aadhaarFrontUrl = result.secure_url;
          
          await new Promise(r => setTimeout(r, 5000)); // 5s break
        }

        // 2. Aadhaar Back
        if (req.files['aadhaarBack']?.[0]) {
          console.log('[Auth] Step 2/3: Aadhaar Back...');
          const result = await uploadToCloudinary(req.files['aadhaarBack'][0].buffer, 'aadhaar_cards', req.files['aadhaarBack'][0].mimetype);
          if (result.secure_url === "upload_failed") throw new Error('Aadhaar Back upload failed');
          aadhaarBackUrl = result.secure_url;
          
          await new Promise(r => setTimeout(r, 5000)); // 5s break
        }

        // 3. Profile Picture
        if (req.files['profilePicture']?.[0]) {
          console.log('[Auth] Step 3/3: Profile Photo...');
          const result = await uploadToCloudinary(req.files['profilePicture'][0].buffer, 'profile_photos', req.files['profilePicture'][0].mimetype);
          if (result.secure_url === "upload_failed") throw new Error('Profile Photo upload failed');
          profilePictureUrl = result.secure_url;
        }
      }

      // Final check: Since they are required on the frontend, if they are null here, something is wrong
      if (!aadhaarFrontUrl || !aadhaarBackUrl || !profilePictureUrl) {
        throw new Error('Some documents failed to upload. Please try again.');
      }

    } catch (uploadError) {
      console.error('❌ Document upload failed, aborting registration:', uploadError.message);
      return res.status(500).json({ 
        error: `Failed to upload documents: ${uploadError.message}. Please check your connection and try again.` 
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

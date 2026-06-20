import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import { validatePassword } from '../../utils/password.util.js';

// Registration handler - Now strictly using direct Cloudinary URLs from frontend
export const registerUser = async (req, res) => {
  console.log('--- REGISTRATION ATTEMPT START ---');
  console.log('Body keys:', Object.keys(req.body));
  try {
    const {
      fullName, email, password, mobileNumber,
      fatherName, fatherPhone, motherName, motherPhone,
      dateOfBirth, gender, permanentAddress, aadhaarNumber,
      // URLs uploaded directly to Cloudinary from the frontend
      aadhaarFrontUrl, aadhaarBackUrl, profilePictureUrl
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !mobileNumber || !aadhaarNumber) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Strictly require all document URLs
    if (!aadhaarFrontUrl || !aadhaarBackUrl || !profilePictureUrl) {
      return res.status(400).json({ error: 'All documents (Profile Photo, Aadhaar Front & Back) must be uploaded before registering.' });
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
    console.log(`✅ Registered new tenant: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.'
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

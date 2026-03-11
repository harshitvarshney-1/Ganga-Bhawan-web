import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';

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

    let aadhaarFileUrl = null;
    let aadhaarFileData = null;

    if (req.files && req.files['aadhaarFile'] && req.files['aadhaarFile'][0]) {
      const file = req.files['aadhaarFile'][0];
      aadhaarFileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      aadhaarFileData = {
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname
      };
    }

    const newUser = new User({
      fullName, email, password: hashedPassword, mobileNumber,
      fatherName, fatherPhone, motherName, motherPhone,
      dateOfBirth, gender, permanentAddress, aadhaarNumber,
      aadhaarFile: aadhaarFileUrl,
      aadhaarFileData: aadhaarFileData,
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

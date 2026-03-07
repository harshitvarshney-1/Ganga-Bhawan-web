import bcrypt from 'bcryptjs';
import User from '../../models/User.js';

const registerController = async (req, res) => {
  try {
    const {
      fullName, email, password, mobileNumber,
      fatherName, fatherPhone, motherName, motherPhone,
      dateOfBirth, gender, permanentAddress, aadhaarNumber
    } = req.body;

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

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      mobileNumber,
      fatherName,
      fatherPhone,
      motherName,
      motherPhone,
      dateOfBirth,
      gender,
      permanentAddress,
      aadhaarNumber,
      aadhaarFile: req.files['aadhaarFile']?.[0] ? `data:${req.files['aadhaarFile'][0].mimetype};base64,${req.files['aadhaarFile'][0].buffer.toString('base64')}` : null,
      aadhaarFileData: req.files['aadhaarFile']?.[0] ? {
        data: req.files['aadhaarFile'][0].buffer,
        contentType: req.files['aadhaarFile'][0].mimetype,
        filename: req.files['aadhaarFile'][0].originalname
      } : null,
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

export default registerController;

import User from '../../models/user.model.js';
import { uploadToCloudinary } from '../../infra/cloudinary.js';

export const updateTenantProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      fullName,
      email,
      mobileNumber,
      fatherName,
      motherName,
      dateOfBirth,
      gender,
      permanentAddress
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email.toLowerCase();
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (fatherName) user.fatherName = fatherName;
    if (motherName) user.motherName = motherName;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (permanentAddress) user.permanentAddress = permanentAddress;

    if (req.file) {
      try {
        console.log('Uploading profile picture to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer, 'profiles', req.file.mimetype);
        user.profilePicture = result.secure_url;
        console.log('Profile picture uploaded successfully:', result.secure_url);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // We choose to continue or return error based on importance. 
        // For profile update, failing the image upload might be critical enough to return error.
        return res.status(500).json({ error: 'Failed to upload image. Please check storage configuration.' });
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: await User.findById(userId).select('-password')
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
};

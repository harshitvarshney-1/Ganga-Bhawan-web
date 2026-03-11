import User from '../../models/user.model.js';

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
      user.profilePicture = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      user.profilePictureData = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
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

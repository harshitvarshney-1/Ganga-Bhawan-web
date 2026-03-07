import User from "../../models/User";

const getTenantProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

export default getTenantProfile;

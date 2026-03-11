export const logoutUser = (req, res) => {
  // Simple logout since we are using JWT tokens without server-side invalidation
  res.json({ success: true, message: 'Logged out successfully' });
};

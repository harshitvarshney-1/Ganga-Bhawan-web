import User from '../../models/user.model.js';

export const getPendingTenants = async (req, res) => {
  try {
    const tenants = await User.find({
      role: 'tenant',
      isApproved: false
    });

    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getApprovedTenants = async (req, res) => {
  try {
    const tenants = await User.find({
      role: 'tenant',
      isApproved: true
    });

    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const approveTenant = async (req, res) => {
  try {
    const tenant = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      success: true,
      message: 'Tenant approved successfully',
      tenant
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const rejectTenant = async (req, res) => {
  try {
    const tenant = await User.findByIdAndDelete(req.params.id);

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      success: true,
      message: 'Tenant rejected successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    const tenant = await User.findByIdAndDelete(req.params.id);

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      success: true,
      message: 'Tenant deleted permanently'
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

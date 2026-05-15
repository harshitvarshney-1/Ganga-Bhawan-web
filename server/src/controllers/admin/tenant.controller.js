import User from '../../models/user.model.js';
import { sendEmail, getWelcomeEmailTemplate } from '../../utils/email.util.js';

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
      isApproved: true,
      isDisabled: { $ne: true }
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

    // Send Welcome Email in background to keep UI fast
    sendEmail({
      to: tenant.email,
      subject: 'Registration Approved - Welcome to Ganga Bhawan!',
      html: emailHtml
    }).catch(emailError => console.error('❌ Background Welcome Email Failed:', emailError));
    
    console.log(`✅ Welcome email triggered for ${tenant.email}`);

    res.json({
      success: true,
      message: 'Tenant approved successfully. Welcome email sent.',
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

export const getDisabledTenants = async (req, res) => {
  try {
    const tenants = await User.find({
      role: 'tenant',
      isDisabled: true
    });

    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const disableTenant = async (req, res) => {
  try {
    const tenant = await User.findByIdAndUpdate(
      req.params.id,
      { isDisabled: true },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      success: true,
      message: 'Account disabled successfully. User can no longer login.',
      tenant
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const enableTenant = async (req, res) => {
  try {
    const tenant = await User.findByIdAndUpdate(
      req.params.id,
      { isDisabled: false },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      success: true,
      message: 'Account enabled successfully. User can now login.',
      tenant
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Payment = require('../models/Payment');
const fs = require('fs');
const path = require('path');
const fileManager = require('../utils/fileManager');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// GET: All pending tenant approvals
router.get('/pending-tenants', auth, isAdmin, async (req, res) => {
  try {
    const tenants = await User.find({ 
      role: 'tenant', 
      isApproved: false 
    }).select('-password');
    
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: All approved tenants
router.get('/approved-tenants', auth, isAdmin, async (req, res) => {
  try {
    const tenants = await User.find({ 
      role: 'tenant', 
      isApproved: true 
    }).select('-password');
    
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST: Approve tenant
router.post('/approve-tenant/:id', auth, isAdmin, async (req, res) => {
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
});

// DELETE: Reject tenant (for pending tenants)
router.delete('/reject-tenant/:id', auth, isAdmin, async (req, res) => {
  try {
    const tenant = await User.findByIdAndDelete(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Clean up associated files for rejected tenant
    const filesToDelete = [];
    if (tenant.aadhaarDocument) filesToDelete.push(tenant.aadhaarDocument);
    if (tenant.profilePicture) filesToDelete.push(tenant.profilePicture);
    
    for (const filePath of filesToDelete) {
      try {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Deleted file for rejected tenant: ${filePath}`);
        }
      } catch (fileError) {
        console.error(`Error deleting file ${filePath}:`, fileError);
      }
    }
    
    res.json({ 
      success: true,
      message: 'Tenant rejected and files cleaned up successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE: Permanently delete tenant (for when tenant leaves PG)
router.delete('/delete-tenant/:id', auth, isAdmin, async (req, res) => {
  try {
    const tenant = await User.findByIdAndDelete(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Clean up associated files
    const filesToDelete = [];
    if (tenant.aadhaarDocument) filesToDelete.push(tenant.aadhaarDocument);
    if (tenant.profilePicture) filesToDelete.push(tenant.profilePicture);
    
    for (const filePath of filesToDelete) {
      try {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Deleted file: ${filePath}`);
        }
      } catch (fileError) {
        console.error(`Error deleting file ${filePath}:`, fileError);
      }
    }
    
    res.json({ 
      success: true,
      message: 'Tenant and associated files deleted permanently' 
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: Payments summary for all tenants
router.get('/payments-summary', auth, isAdmin, async (req, res) => {
  try {
    const tenants = await User.find({ role: 'tenant' });
    const summary = [];

    for (const tenant of tenants) {
      // Find latest approved payment
      const latestPayment = await Payment.findOne({
        userId: tenant._id,
        status: 'approved'
      }).sort({ createdAt: -1 });

      if (latestPayment) {
        summary.push({
          tenantId: tenant._id.toString(), // Important: convert to string
          latestMonthPaid: latestPayment.month,
          status: 'success'
        });
      } else {
        // Check if any pending payment
        const pendingPayment = await Payment.findOne({
          userId: tenant._id,
          status: 'pending'
        });

        summary.push({
          tenantId: tenant._id.toString(),
          latestMonthPaid: null,
          status: pendingPayment ? 'pending' : 'failed'
        });
      }
    }

    res.json(summary);
  } catch (error) {
    console.error('Error fetching payments summary:', error);
    res.status(500).json({ error: 'Failed to fetch payments summary' });
  }
});

// GET: Pending Payments (for admin approval)
router.get('/pending-payments', auth, isAdmin, async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('userId', 'fullName email mobileNumber')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
});

// POST: Approve Payment
router.post('/approve-payment/:paymentId', auth, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment is not pending' });
    }
    
    payment.status = 'approved';
    payment.approvedBy = req.user.userId || req.user.id;
    payment.approvedAt = new Date();
    
    await payment.save();
    
    res.json({
      success: true,
      message: 'Payment approved successfully',
      payment
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

// POST: Reject Payment
router.post('/reject-payment/:paymentId', auth, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment is not pending' });
    }
    
    payment.status = 'rejected';
    payment.approvedBy = req.user.userId || req.user.id;
    payment.approvedAt = new Date();
    
    await payment.save();
    
    res.json({
      success: true,
      message: 'Payment rejected',
      payment
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// GET: Payments for a specific tenant
router.get('/tenant-payments/:tenantId', auth, isAdmin, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const payments = await Payment.find({ userId: tenantId })
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching tenant payments:', error);
    res.status(500).json({ error: 'Failed to fetch tenant payments' });
  }
});

// FILE MANAGEMENT ROUTES

// GET: File storage statistics
router.get('/file-stats', auth, isAdmin, async (req, res) => {
  try {
    const allUsers = await User.find({}).select('aadhaarDocument profilePicture');
    const stats = {
      totalUsers: allUsers.length,
      usersWithDocuments: allUsers.filter(u => u.aadhaarDocument).length,
      usersWithProfilePics: allUsers.filter(u => u.profilePicture).length,
      fileStats: {}
    };

    // Check file existence and stats
    for (const user of allUsers) {
      if (user.aadhaarDocument) {
        stats.fileStats[user.aadhaarDocument] = fileManager.getFileStats(user.aadhaarDocument);
      }
      if (user.profilePicture) {
        stats.fileStats[user.profilePicture] = fileManager.getFileStats(user.profilePicture);
      }
    }

    res.json(stats);
  } catch (error) {
    console.error('Error getting file stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST: Create backup of all files
router.post('/create-backup', auth, isAdmin, async (req, res) => {
  try {
    const result = fileManager.createBackup();
    if (result.success) {
      res.json({
        success: true,
        message: `Backup created successfully with ${result.filesBackedUp} files`,
        backupPath: result.backupPath
      });
    } else {
      res.status(500).json({ error: 'Failed to create backup', details: result.error });
    }
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST: Cleanup orphaned files
router.post('/cleanup-files', auth, isAdmin, async (req, res) => {
  try {
    const allUsers = await User.find({}).select('aadhaarDocument profilePicture');
    const result = await fileManager.cleanupOrphanedFiles(allUsers);

    if (result.error) {
      res.status(500).json({ error: 'Cleanup failed', details: result.error });
    } else {
      res.json({
        success: true,
        message: `Cleaned up ${result.cleanedCount} orphaned files out of ${result.totalFiles} total files`
      });
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: Validate all user files
router.get('/validate-files', auth, isAdmin, async (req, res) => {
  try {
    const allUsers = await User.find({}).select('aadhaarDocument profilePicture fullName email');
    const validationResults = [];

    for (const user of allUsers) {
      const userFiles = [];
      if (user.aadhaarDocument) {
        userFiles.push({
          type: 'aadhaar',
          path: user.aadhaarDocument,
          validation: fileManager.validateFile(user.aadhaarDocument)
        });
      }
      if (user.profilePicture) {
        userFiles.push({
          type: 'profile',
          path: user.profilePicture,
          validation: fileManager.validateFile(user.profilePicture)
        });
      }

      if (userFiles.length > 0) {
        validationResults.push({
          user: {
            id: user._id,
            name: user.fullName,
            email: user.email
          },
          files: userFiles
        });
      }
    }

    const validFiles = validationResults.flatMap(u => u.files).filter(f => f.validation.valid).length;
    const invalidFiles = validationResults.flatMap(u => u.files).filter(f => !f.validation.valid).length;

    res.json({
      totalUsers: allUsers.length,
      usersWithFiles: validationResults.length,
      validFiles,
      invalidFiles,
      details: validationResults
    });
  } catch (error) {
    console.error('Error validating files:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
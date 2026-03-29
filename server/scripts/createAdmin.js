const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');

// Admin credentials
const adminData = {
  fullName: 'Harshit Varshney',
  email: 'harshitvarshney822@gmail.com',
  password: 'Harshit@1212',
  mobileNumber: '9999999999',
  fatherName: 'Admin',
  fatherPhone: '9999999999',
  motherName: 'Admin',
  motherPhone: '9999999999',
  dateOfBirth: new Date('1990-01-01'),
  gender: 'Male',
  permanentAddress: 'Admin Address',
  aadhaarNumber: '000000000000', // Dummy Aadhaar for admin
  role: 'admin',
  isApproved: true
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: adminData.email.toLowerCase() 
    });

    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('✅ Admin account already exists!');
        console.log('Email:', existingAdmin.email);
        console.log('Role:', existingAdmin.role);
        
        // Update password if needed
        const isPasswordValid = await bcrypt.compare(adminData.password, existingAdmin.password);
        if (!isPasswordValid) {
          console.log('🔄 Updating admin password...');
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(adminData.password, salt);
          existingAdmin.password = hashedPassword;
          await existingAdmin.save();
          console.log('✅ Password updated successfully!');
        }
      } else {
        console.log('⚠️  User exists but is not an admin. Updating to admin...');
        existingAdmin.role = 'admin';
        existingAdmin.isApproved = true;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        console.log('✅ User updated to admin successfully!');
      }
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);

      // Create admin user
      const admin = new User({
        ...adminData,
        password: hashedPassword,
        email: adminData.email.toLowerCase()
      });

      await admin.save();
      console.log('✅ Admin account created successfully!');
      console.log('Email:', admin.email);
      console.log('Password:', adminData.password);
    }

    console.log('\n📝 Login Credentials:');
    console.log('Email: harshitvarshney822@gmail.com');
    console.log('Password: Harshit@1212');
    console.log('\n✅ You can now login to the admin portal!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();


const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: 'admin@uei.gov.in' });
    
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin
    const admin = await Admin.create({
      name: 'System Administrator',
      email: 'admin@uei.gov.in',
      password: hashedPassword,
      phoneNumber: '9999999999',
      designation: 'System Administrator',
      department: 'Ministry of Education',
      permissions: [
        {
          module: 'all',
          actions: ['create', 'read', 'update', 'delete']
        }
      ]
    });

    console.log('Admin created successfully!');
    console.log('Email: admin@uei.gov.in');
    console.log('Password: admin123');
    console.log('Please change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

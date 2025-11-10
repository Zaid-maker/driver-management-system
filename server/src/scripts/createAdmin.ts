import { connectDB } from '../config/database.js';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    console.log('🔐 Starting admin creation...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log('   To create a new admin, delete the existing one first.');
      process.exit(0);
    }

    // Create admin with default credentials
    const admin = await User.create({
      email: 'admin@drivermanagement.com',
      password: 'admin123', // Change this immediately after first login!
      role: 'admin',
      isActive: true,
    });

    console.log('\n✅ Admin created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123`);
    console.log('\n⚠️  IMPORTANT: Change the password immediately after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

// Run the function
createAdmin();

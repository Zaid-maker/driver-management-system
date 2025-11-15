/// <reference types="node" />
import { connectDB } from '../config/database.js';
import { Driver } from '../models/driver.model.js';
import { User } from '../models/user.model.js';

const sampleDrivers = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0101',
    dateOfBirth: new Date('1985-03-15'),
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    licenseNumber: 'NY123456789',
    licenseExpiry: new Date('2026-03-15'),
    licenseClass: 'Class A',
    status: 'active' as const,
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1-555-0102',
    dateOfBirth: new Date('1990-07-22'),
    address: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    licenseNumber: 'CA987654321',
    licenseExpiry: new Date('2025-12-31'),
    licenseClass: 'Class B',
    status: 'active' as const,
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1-555-0103',
    dateOfBirth: new Date('1988-11-08'),
    address: '789 Pine Street',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    licenseNumber: 'IL456789123',
    licenseExpiry: new Date('2024-06-30'),
    licenseClass: 'Class C',
    status: 'inactive' as const,
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1-555-0104',
    dateOfBirth: new Date('1992-05-18'),
    address: '321 Elm Drive',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    licenseNumber: 'TX789123456',
    licenseExpiry: new Date('2027-05-18'),
    licenseClass: 'Class A',
    status: 'active' as const,
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '+1-555-0105',
    dateOfBirth: new Date('1987-09-30'),
    address: '654 Maple Lane',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    licenseNumber: 'AZ321654987',
    licenseExpiry: new Date('2026-09-30'),
    licenseClass: 'Class B',
    status: 'pending' as const,
  },
  {
    name: 'Jessica Martinez',
    email: 'jessica.martinez@example.com',
    phone: '+1-555-0106',
    dateOfBirth: new Date('1991-02-14'),
    address: '987 Cedar Court',
    city: 'Philadelphia',
    state: 'PA',
    zipCode: '19101',
    licenseNumber: 'PA654987321',
    licenseExpiry: new Date('2025-02-14'),
    licenseClass: 'Class C',
    status: 'active' as const,
  },
  {
    name: 'Robert Taylor',
    email: 'robert.taylor@example.com',
    phone: '+1-555-0107',
    dateOfBirth: new Date('1984-12-05'),
    address: '147 Birch Road',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78201',
    licenseNumber: 'TX147258369',
    licenseExpiry: new Date('2024-12-05'),
    licenseClass: 'Class A',
    status: 'inactive' as const,
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    phone: '+1-555-0108',
    dateOfBirth: new Date('1989-08-27'),
    address: '258 Spruce Avenue',
    city: 'San Diego',
    state: 'CA',
    zipCode: '92101',
    licenseNumber: 'CA258369147',
    licenseExpiry: new Date('2026-08-27'),
    licenseClass: 'Class B',
    status: 'active' as const,
  },
  {
    name: 'James Thomas',
    email: 'james.thomas@example.com',
    phone: '+1-555-0109',
    dateOfBirth: new Date('1986-04-19'),
    address: '369 Willow Street',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    licenseNumber: 'TX369147258',
    licenseExpiry: new Date('2025-04-19'),
    licenseClass: 'Class C',
    status: 'pending' as const,
  },
  {
    name: 'Jennifer Jackson',
    email: 'jennifer.jackson@example.com',
    phone: '+1-555-0110',
    dateOfBirth: new Date('1993-06-12'),
    address: '741 Ash Boulevard',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95101',
    licenseNumber: 'CA741852963',
    licenseExpiry: new Date('2027-06-12'),
    licenseClass: 'Class A',
    status: 'active' as const,
  },
  {
    name: 'William White',
    email: 'william.white@example.com',
    phone: '+1-555-0111',
    dateOfBirth: new Date('1983-10-25'),
    address: '852 Poplar Place',
    city: 'Austin',
    state: 'TX',
    zipCode: '73301',
    licenseNumber: 'TX852963741',
    licenseExpiry: new Date('2024-10-25'),
    licenseClass: 'Class B',
    status: 'inactive' as const,
  },
  {
    name: 'Mary Harris',
    email: 'mary.harris@example.com',
    phone: '+1-555-0112',
    dateOfBirth: new Date('1994-01-08'),
    address: '963 Chestnut Way',
    city: 'Jacksonville',
    state: 'FL',
    zipCode: '32099',
    licenseNumber: 'FL963741852',
    licenseExpiry: new Date('2026-01-08'),
    licenseClass: 'Class C',
    status: 'active' as const,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing data
    const deleteDriversResult = await Driver.deleteMany({});
    console.log(`🗑️  Cleared ${deleteDriversResult.deletedCount} existing drivers`);
    
    const deleteUsersResult = await User.deleteMany({ role: 'driver' });
    console.log(`🗑️  Cleared ${deleteUsersResult.deletedCount} existing driver users`);

    // Insert sample drivers
    const insertedDrivers = await Driver.insertMany(sampleDrivers);
    console.log(`✅ Successfully inserted ${insertedDrivers.length} drivers`);

    // Create user accounts for some drivers (first 6 drivers will have accounts)
    const driversWithAccounts = insertedDrivers.slice(0, 6);
    const userAccounts = [];
    
    console.log('\n👤 Creating driver user accounts...');
    for (const driver of driversWithAccounts) {
      try {
        const user = await User.create({
          email: driver.email,
          password: 'driver123', // Default password for all seeded driver accounts
          role: 'driver',
          driver: driver._id, // Changed from driverId to driver
          isActive: driver.status === 'active',
        });
        
        // Update driver with userId reference
        driver.userId = user._id as any;
        await driver.save();
        
        userAccounts.push(user);
        console.log(`   ✅ Created account for ${driver.name} (${driver.email})`);
      } catch (error: any) {
        console.log(`   ⚠️  Failed to create account for ${driver.name}: ${error.message}`);
      }
    }

    console.log(`\n✅ Successfully created ${userAccounts.length} driver user accounts`);

    // Display summary
    console.log('\n📊 Database Summary:');
    const stats = await Promise.all([
      Driver.countDocuments({ status: 'active' }),
      Driver.countDocuments({ status: 'inactive' }),
      Driver.countDocuments({ status: 'pending' }),
      Driver.countDocuments({ userId: { $exists: true, $ne: null } }),
    ]);

    console.log(`   - Active drivers: ${stats[0]}`);
    console.log(`   - Inactive drivers: ${stats[1]}`);
    console.log(`   - Pending drivers: ${stats[2]}`);
    console.log(`   - Total drivers: ${insertedDrivers.length}`);
    console.log(`   - Drivers with accounts: ${stats[3]}`);
    console.log(`   - Drivers without accounts: ${insertedDrivers.length - stats[3]}`);

    console.log('\n📝 Login Credentials for Seeded Driver Accounts:');
    console.log('   Email: [driver email from list above]');
    console.log('   Password: driver123');
    console.log('\n   First 6 drivers have accounts created.');

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

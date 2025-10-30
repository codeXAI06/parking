const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ParkingArea = require('./models/ParkingArea');
const User = require('./models/User');

dotenv.config();

// Sample parking areas data - Hyderabad locations
const parkingAreas = [
  {
    name: 'Hitech City Metro Station Parking',
    location: { lat: 17.4484, lng: 78.3908 },
    address: 'HITEC City, Hyderabad, Telangana 500081',
    totalSlots: 50,
    slots: Array.from({ length: 50 }, (_, i) => ({
      slotNumber: i + 1,
      isAvailable: Math.random() > 0.3
    }))
  },
  {
    name: 'Charminar Heritage Parking',
    location: { lat: 17.3616, lng: 78.4747 },
    address: 'Charminar Road, Hyderabad, Telangana 500002',
    totalSlots: 40,
    slots: Array.from({ length: 40 }, (_, i) => ({
      slotNumber: i + 1,
      isAvailable: Math.random() > 0.4
    }))
  },
  {
    name: 'Banjara Hills Shopping Complex',
    location: { lat: 17.4239, lng: 78.4738 },
    address: 'Road No 12, Banjara Hills, Hyderabad, Telangana 500034',
    totalSlots: 60,
    slots: Array.from({ length: 60 }, (_, i) => ({
      slotNumber: i + 1,
      isAvailable: Math.random() > 0.5
    }))
  },
  {
    name: 'Gachibowli IT Hub Parking',
    location: { lat: 17.4399, lng: 78.3489 },
    address: 'Gachibowli, Hyderabad, Telangana 500032',
    totalSlots: 75,
    slots: Array.from({ length: 75 }, (_, i) => ({
      slotNumber: i + 1,
      isAvailable: Math.random() > 0.6
    }))
  },
  {
    name: 'Secunderabad Railway Station Parking',
    location: { lat: 17.4344, lng: 78.5013 },
    address: 'Secunderabad, Hyderabad, Telangana 500003',
    totalSlots: 80,
    slots: Array.from({ length: 80 }, (_, i) => ({
      slotNumber: i + 1,
      isAvailable: Math.random() > 0.4
    }))
  }
];

// Default admin and user accounts
const users = [
  {
    username: 'admin',
    email: 'admin@smartparking.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'user',
    email: 'user@smartparking.com',
    password: 'user123',
    role: 'user'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await ParkingArea.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert parking areas
    await ParkingArea.insertMany(parkingAreas);
    console.log('✅ Added parking areas');

    // Insert users (using save() to trigger password hashing)
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    console.log('✅ Added users');

    console.log('\n📊 Seed data summary:');
    console.log(`   - ${parkingAreas.length} parking areas created`);
    console.log(`   - ${users.length} users created`);
    console.log('\n👤 Login credentials:');
    console.log('   Admin: admin@smartparking.com / admin123');
    console.log('   User:  user@smartparking.com / user123');

    mongoose.connection.close();
    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

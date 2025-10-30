const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({});
    console.log(`📊 Total users in database: ${users.length}\n`);

    for (const user of users) {
      console.log('👤 User:', {
        username: user.username,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      });

      // Test password comparison
      const testPasswords = ['admin123', 'user123', 'password123'];
      for (const pwd of testPasswords) {
        const isMatch = await user.comparePassword(pwd);
        if (isMatch) {
          console.log(`   ✅ Password "${pwd}" works for ${user.email}`);
        }
      }
      console.log('');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();

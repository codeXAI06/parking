const mongoose = require('mongoose');
const ParkingSession = require('./models/ParkingSession');
const ParkingArea = require('./models/ParkingArea');
require('dotenv').config();

async function clearActiveSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all active sessions
    const activeSessions = await ParkingSession.find({ status: 'active' });
    console.log(`Found ${activeSessions.length} active sessions\n`);

    for (const session of activeSessions) {
      console.log(`Clearing session: ${session._id}`);
      
      // Mark session as completed
      session.status = 'completed';
      session.exitTime = new Date();
      await session.save();

      // Free up the slot
      const parkingArea = await ParkingArea.findById(session.parkingArea);
      if (parkingArea) {
        const slot = parkingArea.slots.find(s => s.slotNumber === session.slotNumber);
        if (slot) {
          slot.isAvailable = true;
          await parkingArea.save();
          console.log(`  ✅ Freed slot #${session.slotNumber}`);
        }
      }
    }

    console.log('\n✅ All active sessions cleared!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearActiveSessions();

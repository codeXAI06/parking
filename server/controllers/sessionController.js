const ParkingSession = require('../models/ParkingSession');
const ParkingArea = require('../models/ParkingArea');

// Enter parking - Start a new session
exports.enterParking = async (req, res) => {
  try {
    const { parkingAreaId, slotNumber } = req.body;
    const userId = req.user.userId;

    // Check if user already has an active session
    const activeSession = await ParkingSession.findOne({
      user: userId,
      status: 'active'
    });

    if (activeSession) {
      return res.status(400).json({ 
        message: 'You already have an active parking session. Please exit first.' 
      });
    }

    // Find parking area and update slot status
    const parkingArea = await ParkingArea.findById(parkingAreaId);
    
    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    const slot = parkingArea.slots.find(s => s.slotNumber === slotNumber);
    
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (!slot.isAvailable) {
      return res.status(400).json({ message: 'Slot is already occupied' });
    }

    // Mark slot as occupied
    slot.isAvailable = false;
    await parkingArea.save();

    // Create new parking session
    const session = new ParkingSession({
      user: userId,
      parkingArea: parkingAreaId,
      slotNumber
    });

    await session.save();

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('slotUpdated', {
        parkingAreaId,
        slotNumber,
        isAvailable: false
      });
    }

    const populatedSession = await ParkingSession.findById(session._id)
      .populate('parkingArea', 'name address');

    res.status(201).json({
      message: 'Successfully entered parking',
      session: populatedSession
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error entering parking', 
      error: error.message 
    });
  }
};

// Exit parking - End current session
exports.exitParking = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find active session
    const session = await ParkingSession.findOne({
      user: userId,
      status: 'active'
    }).populate('parkingArea', 'name address');

    if (!session) {
      return res.status(404).json({ message: 'No active parking session found' });
    }

    // Update session
    session.exitTime = new Date();
    session.status = 'completed';
    await session.save();

    // Update slot status in parking area
    const parkingArea = await ParkingArea.findById(session.parkingArea._id);
    const slot = parkingArea.slots.find(s => s.slotNumber === session.slotNumber);
    if (slot) {
      slot.isAvailable = true;
      await parkingArea.save();

      // Emit socket event for real-time update
      if (req.app.get('io')) {
        req.app.get('io').emit('slotUpdated', {
          parkingAreaId: session.parkingArea._id,
          slotNumber: session.slotNumber,
          isAvailable: true
        });
      }
    }

    res.json({
      message: 'Successfully exited parking',
      session: {
        parkingArea: session.parkingArea,
        slotNumber: session.slotNumber,
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        duration: session.duration
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error exiting parking', 
      error: error.message 
    });
  }
};

// Get current active session
exports.getActiveSession = async (req, res) => {
  try {
    const userId = req.user.userId;

    const session = await ParkingSession.findOne({
      user: userId,
      status: 'active'
    }).populate('parkingArea', 'name address location');

    res.json({ session });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching active session', 
      error: error.message 
    });
  }
};

// Get parking history
exports.getParkingHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const sessions = await ParkingSession.find({ user: userId })
      .populate('parkingArea', 'name address')
      .sort({ entryTime: -1 })
      .limit(50);

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching parking history', 
      error: error.message 
    });
  }
};

const ParkingArea = require('../models/ParkingArea');

// Get all parking areas
exports.getAllParkings = async (req, res) => {
  try {
    const parkings = await ParkingArea.find();
    res.json(parkings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parking areas', error: error.message });
  }
};

// Get parking area by ID
exports.getParkingById = async (req, res) => {
  try {
    const parking = await ParkingArea.findById(req.params.id);
    if (!parking) {
      return res.status(404).json({ message: 'Parking area not found' });
    }
    res.json(parking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parking area', error: error.message });
  }
};

// Create new parking area
exports.createParking = async (req, res) => {
  try {
    const { name, location, address, totalSlots } = req.body;
    
    // Initialize slots
    const slots = [];
    for (let i = 1; i <= totalSlots; i++) {
      slots.push({
        slotNumber: i,
        isAvailable: true
      });
    }

    const parking = new ParkingArea({
      name,
      location,
      address,
      totalSlots,
      slots
    });

    await parking.save();
    res.status(201).json(parking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating parking area', error: error.message });
  }
};

// Update slot status
exports.updateSlotStatus = async (req, res, io) => {
  try {
    const { id } = req.params;
    const { slotNumber, isAvailable } = req.body;

    const parking = await ParkingArea.findById(id);
    if (!parking) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    const slot = parking.slots.find(s => s.slotNumber === slotNumber);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    slot.isAvailable = isAvailable;
    slot.lastUpdated = new Date();
    
    await parking.save();

    // Emit socket event for real-time update
    io.emit('slotUpdated', {
      parkingId: id,
      slotNumber,
      isAvailable,
      availableSlots: parking.availableSlots,
      totalSlots: parking.totalSlots
    });

    res.json({ 
      message: 'Slot updated successfully', 
      parking,
      availableSlots: parking.availableSlots
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating slot', error: error.message });
  }
};

// Get occupancy stats
exports.getOccupancyStats = async (req, res) => {
  try {
    const parkings = await ParkingArea.find();
    
    const stats = parkings.map(parking => ({
      id: parking._id,
      name: parking.name,
      totalSlots: parking.totalSlots,
      availableSlots: parking.availableSlots,
      occupiedSlots: parking.totalSlots - parking.availableSlots,
      occupancyRate: ((parking.totalSlots - parking.availableSlots) / parking.totalSlots * 100).toFixed(2)
    }));

    const totalStats = {
      totalParkingAreas: parkings.length,
      totalSlots: parkings.reduce((sum, p) => sum + p.totalSlots, 0),
      totalAvailable: parkings.reduce((sum, p) => sum + p.availableSlots, 0),
      totalOccupied: parkings.reduce((sum, p) => sum + (p.totalSlots - p.availableSlots), 0)
    };

    res.json({ parkingStats: stats, overall: totalStats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Calculate nearest parking (Haversine formula)
exports.getNearestParking = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const parkings = await ParkingArea.find();
    
    // Calculate distance for each parking
    const parkingsWithDistance = parkings.map(parking => {
      const distance = calculateDistance(
        userLat, 
        userLng, 
        parking.location.lat, 
        parking.location.lng
      );
      
      return {
        ...parking.toObject(),
        distance: parseFloat(distance.toFixed(2))
      };
    });

    // Sort by distance and filter available slots
    const sortedParkings = parkingsWithDistance
      .filter(p => p.availableSlots > 0)
      .sort((a, b) => a.distance - b.distance);

    res.json(sortedParkings);
  } catch (error) {
    res.status(500).json({ message: 'Error finding nearest parking', error: error.message });
  }
};

// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/parkings', parkingController.getAllParkings);
router.get('/parkings/:id', parkingController.getParkingById);
router.get('/parkings/nearest/search', parkingController.getNearestParking);
router.get('/stats/occupancy', parkingController.getOccupancyStats);

// Admin routes
router.post('/parkings', auth, adminAuth, parkingController.createParking);

// Export router with io setter
module.exports = (io) => {
  // Update slot status (admin only) - needs io for socket emission
  router.post('/parkings/:id/slot/update', auth, adminAuth, (req, res) => {
    parkingController.updateSlotStatus(req, res, io);
  });
  
  return router;
};

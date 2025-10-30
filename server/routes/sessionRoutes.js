const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { auth } = require('../middleware/auth');

// All session routes require authentication
router.post('/enter', auth, sessionController.enterParking);
router.post('/exit', auth, sessionController.exitParking);
router.get('/active', auth, sessionController.getActiveSession);
router.get('/history', auth, sessionController.getParkingHistory);

module.exports = router;

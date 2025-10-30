const mongoose = require('mongoose');

const parkingSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingArea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingArea',
    required: true
  },
  slotNumber: {
    type: Number,
    required: true
  },
  entryTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  exitTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in minutes
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
});

// Calculate duration before saving
parkingSessionSchema.pre('save', function(next) {
  if (this.exitTime && this.entryTime) {
    this.duration = Math.round((this.exitTime - this.entryTime) / 60000); // Convert to minutes
  }
  next();
});

module.exports = mongoose.model('ParkingSession', parkingSessionSchema);

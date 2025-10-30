const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotNumber: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const parkingAreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  totalSlots: {
    type: Number,
    required: true
  },
  slots: [slotSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field for available slots count
parkingAreaSchema.virtual('availableSlots').get(function() {
  if (!this.slots || !Array.isArray(this.slots)) {
    return 0;
  }
  return this.slots.filter(slot => slot.isAvailable).length;
});

// Ensure virtuals are included in JSON
parkingAreaSchema.set('toJSON', { virtuals: true });
parkingAreaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ParkingArea', parkingAreaSchema);

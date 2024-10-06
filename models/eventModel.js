const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    address: String,
    lat: Number,
    lng: Number,
    city: String,
  },
  startDate: Date,
  endDate: Date,
  isFree: Boolean,
  language: String,
  category: {
    type: String,
    required: true,
  },
  createdBy: String,
  ticketClasses: [{
    name: String,
    cost: {
      currency: String,
      value: Number,
    },
    free: Boolean,
  }],
  description: { 
    type: String,
    required: false,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;

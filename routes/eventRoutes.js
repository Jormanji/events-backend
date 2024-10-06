const express = require('express');
const router = express.Router();
const Event = require('../models/eventModel');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if a user is logged in
function isAuthenticated(req, res, next) {
  if (!req.body.createdBy) {
    return res.status(401).json({ message: 'You must be logged in' });
  }
  next();
}

// Create Event with location validation
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, startDate, endDate, location } = req.body;

    if (!location || !location.lat || !location.lng || !location.city || !location.address) {
      return res.status(400).json({ message: 'Incomplete location details' });
    }

    const event = new Event({
      name,
      startDate,
      endDate,
      location, 
      createdBy: req.body.createdBy,
      isFree: req.body.isFree || false,
      category: req.body.category || 'Other',
      description: req.body.description || '',
      language: req.body.language || 'English',
      signups: [],
    });

    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});

router.post('/signup/:eventId', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    const event = await Event.findById(req.params.eventId);

    console.log("Event before adding participant:", event);

    // Check if user is already signed up
    if (event.participants.includes(user._id)) {
      console.log("User is already signed up");
      return res.status(400).json({ message: "User already signed up" });
    }

    // Add user to participants
    event.participants.push(user._id);

    console.log("Event after adding participant:", event);

    await event.save();

    return res.status(200).json({ message: "User signed up", signupsCount: event.participants.length });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});






// Get all Events with optional filtering, including filtering by city
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, city } = req.query;
    const query = {};

    // Apply case-insensitive category filter
    if (category) {
      query.category = new RegExp(category, 'i'); 
    }

    // Apply city filter
    if (city) {
      query['location.city'] = new RegExp(city, 'i'); 
    }

    // Apply date range filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    console.log('Query:', query); 
    const events = await Event.find(query);
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error });
  }
});

// Get a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event', error });
  }
});

// Update Event (only creator can update)
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy !== req.body.createdBy) {
      return res.status(403).json({ message: 'You are not the creator of this event' });
    }

    Object.assign(event, req.body); 
    await event.save();
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event', error });
  }
});

// Delete Event (only creator can delete)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy !== req.body.createdBy) {
      return res.status(403).json({ message: 'You are not the creator of this event' });
    }

    await event.deleteOne();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event', error });
  }
});

module.exports = router;

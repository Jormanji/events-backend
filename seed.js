const mongoose = require('mongoose');
const Event = require('./models/eventModel');
const User = require('./models/userModel');
const mockEventData = require('./mockEventData');

require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST);
    console.log('Connected to MongoDB');

    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please create a user before seeding events.');
      return;
    }

    const createdBy = users[0].username; 

    await Event.deleteMany({});
    console.log('Existing events deleted.');

    // Transform mock data to match schema
    const eventsToSeed = mockEventData.events.map(event => ({
      name: event.name.text,
      description: event.description.text,
      location: {
        address: event.venue.address.address_1,
        lat: event.venue.latitude,
        lng: event.venue.longitude,
        city: event.venue.address.city,
      },
      startDate: new Date(event.start.local),
      endDate: new Date(event.end.local),
      isFree: event.is_free,
      language: event.language,
      category: event.category.name,
      createdBy: createdBy,
      ticketClasses: Array.isArray(event.ticket_classes) ? event.ticket_classes.map(ticket => ({
        name: ticket.name,
        cost: ticket.cost,
        free: ticket.free,
      })) : []
    }));

    await Event.insertMany(eventsToSeed);
    console.log('Events seeded successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();

const request = require('supertest'); 
const app = require('../index'); 
const mongoose = require('mongoose');
const Event = require('../models/event'); 

// Connect to the test database before all tests
beforeAll(async () => {
  const mongoURI = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/events_platform_test";
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Close the connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Event Routes', () => {
  // Clear the test database before each test to ensure clean state
  beforeEach(async () => {
    await Event.deleteMany({});
  });

  it('should create a new event with full location details', async () => {
    const newEvent = {
      name: "Community Meetup",
      startDate: "2024-10-15T10:00:00Z",
      endDate: "2024-10-15T14:00:00Z",
      isFree: true,
      location: {
        address: "123 Main St",
        lat: 40.7128,
        lng: -74.0060,
        city: "New York" 
      },
      language: "English"
    };

    const response = await request(app)
      .post('/api/events')
      .send(newEvent)
      .expect(201); 

    // Check the response body for the event, including the full location details
    expect(response.body.event).toMatchObject(newEvent);

    // Verify if the event is saved in the database
    const savedEvent = await Event.findOne({ name: "Community Meetup" });
    expect(savedEvent).toMatchObject(newEvent);
  });

  it('should return all events', async () => {
    // Insert a sample event with full location details
    const sampleEvent = new Event({
      name: "Community Meetup",
      startDate: "2024-10-15T10:00:00Z",
      endDate: "2024-10-15T14:00:00Z",
      isFree: true,
      location: {
        address: "123 Main St",
        lat: 40.7128,
        lng: -74.0060,
        city: "New York"
      },
      language: "English"
    });
    await sampleEvent.save();

    const response = await request(app)
      .get('/api/events')
      .expect(200); 

    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Community Meetup');
  });

  // Test for incomplete location details
  it('should return 400 error if location details are incomplete', async () => {
    const incompleteLocationEvent = {
      name: "Incomplete Location Event",
      startDate: "2024-10-15T10:00:00Z",
      endDate: "2024-10-15T14:00:00Z",
      isFree: true,
      location: {
        lat: 40.7128,
        lng: -74.0060
        // Missing address and city
      },
      language: "English"
    };

    const response = await request(app)
      .post('/api/events')
      .send(incompleteLocationEvent)
      .expect(400);

    expect(response.body.message).toBe('Incomplete location details');
  });

  // Test for creating event without location details
  it('should return 400 error if no location details are provided', async () => {
    const noLocationEvent = {
      name: "No Location Event",
      startDate: "2024-10-15T10:00:00Z",
      endDate: "2024-10-15T14:00:00Z",
      isFree: true,
      language: "English"
    };

    const response = await request(app)
      .post('/api/events')
      .send(noLocationEvent)
      .expect(400);

    expect(response.body.message).toBe('Incomplete location details');
  });
});

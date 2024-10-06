const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleController');

// Route to generate the Google auth URL
router.get('/auth/google', googleController.getAuthUrl);

// Route for handling the OAuth callback
router.get('/auth/google/callback', googleController.handleGoogleCallback);

// Route to insert an event into Google Calendar
router.post('/calendar/insert', googleController.insertEventToGoogleCalendar);

// Add route to clear Google auth when user logs out
router.post('/auth/google/logout', googleController.logoutGoogle);


module.exports = router;

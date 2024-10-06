const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5000/auth/google/callback'
);

// Generates the URL to which users will be redirected for Google authentication
exports.getAuthUrl = (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  res.redirect(authUrl);
};

// Logout from Google by clearing Google tokens from the session or user data
exports.logoutGoogle = (req, res) => {
  try {
    // Clear any Google tokens stored in the session or user profile
    if (req.user) {
      req.user.googleTokens = null;
    }
    req.session.tokens = null;

    res.status(200).json({ message: 'Logged out from Google' });
  } catch (error) {
    console.error('Error during Google logout:', error);
    res.status(500).json({ message: 'Failed to log out from Google' });
  }
};



// Handles the callback from Google with authorization code
exports.handleGoogleCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    req.session.tokens = tokens; 
    res.redirect('http://localhost:3000');  
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

// Inserts an event into Google Calendar
exports.insertEventToGoogleCalendar = async (req, res) => {
  try {
    if (!req.session.tokens) {
      console.log('No Google tokens found in session. Redirecting to Google Auth.');
      return res.status(401).json({ message: 'Google authentication required', redirect: '/auth/google' });
    }

    oauth2Client.setCredentials(req.session.tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: req.body.name,
      location: req.body.location,
      description: req.body.description,
      start: {
        dateTime: req.body.startDate,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: req.body.endDate,
        timeZone: 'America/Los_Angeles',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    res.json({ message: 'Event created', eventLink: response.data.htmlLink });
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error);
    res.status(500).json({ message: 'Failed to add event' });
  }
};
